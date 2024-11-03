import tensorflow as tf
import numpy as np
import pandas as pd 
import os
from movenet import Movenet
import wget
import csv
import tqdm 
from data import BodyPart

if 'movenet_thunder.tflite' not in os.listdir():
    wget.download('https://tfhub.dev/google/lite-model/movenet/singlepose/thunder/tflite/float16/4?lite-format=tflite', 'movenet_thunder.tflite')

movenet = Movenet('movenet_thunder')

def detect(input_tensor, inference_count=3):
    movenet.detect(input_tensor.numpy(), reset_crop_region=True)
    
    for _ in range(inference_count - 1):
        detection = movenet.detect(input_tensor.numpy(), 
                                   reset_crop_region=False)
    
    return detection

class Preprocessor:
    """
    This class preprocesses pose samples, predicts keypoints on images, 
    and saves those keypoints in a CSV file for use in the classification task.
    """

    def __init__(self, images_in_folder, csvs_out_path):
        self._images_in_folder = images_in_folder
        self._csvs_out_path = csvs_out_path
        self._csvs_out_folder_per_class = 'csv_per_pose'
        self._message = []
        
        if self._csvs_out_folder_per_class not in os.listdir():
            os.makedirs(self._csvs_out_folder_per_class)
        
        # Get list of pose classes
        self._pose_class_names = sorted([n for n in os.listdir(images_in_folder)])

    def process(self, detection_threshold=0.1):
        """
        Preprocess the images in the given folder by detecting landmarks
        and saving them to CSV files.
        """
        for pose_class_name in self._pose_class_names:
            # Paths for pose class
            images_in_folder = os.path.join(self._images_in_folder, pose_class_name)
            csv_out_path = os.path.join(self._csvs_out_folder_per_class,
                                        pose_class_name + '.csv')

            # Detect landmarks in each image and write to CSV
            with open(csv_out_path, 'w') as csv_out_file:
                csv_out_writer = csv.writer(csv_out_file,
                                            delimiter=',',
                                            quoting=csv.QUOTE_MINIMAL)

                # Get the list of images
                image_names = sorted([n for n in os.listdir(images_in_folder)])
                valid_image_count = 0

                # Detect pose landmarks in each image
                for image_name in tqdm.tqdm(image_names):
                    image_path = os.path.join(images_in_folder, image_name)
                    
                    try:
                        image = tf.io.read_file(image_path)
                        image = tf.io.decode_jpeg(image)
                    except:
                        self._message.append('Skipped ' + image_path + ' Invalid image')
                        continue
                    
                    # Skip images that are not RGB
                    if image.shape[2] != 3:
                        self._message.append('Skipped ' + image_path + ' Image is not in RGB')
                        continue
                    
                    person = detect(image)
                    
                    # Save landmarks if all landmarks are above the threshold
                    min_landmark_score = min([keypoint.score for keypoint in person.keypoints])
                    should_keep_image = min_landmark_score >= detection_threshold
                    if not should_keep_image:
                        self._message.append('Skipped ' + image_path + ' Keypoints score below threshold')
                        continue

                    valid_image_count += 1
                    
                    # Get landmarks and scale to the same size as the input image
                    pose_landmarks = np.array(
                        [[keypoint.coordinate.x, keypoint.coordinate.y, keypoint.score]
                         for keypoint in person.keypoints],
                        dtype=np.float32)

                    # Write landmark coordinates to CSV
                    coord = pose_landmarks.flatten().astype(str).tolist()
                    csv_out_writer.writerow([image_name] + coord)
                    
        print(self._message)

        # Combine all per-class CSVs into a single CSV file
        all_landmarks_df = self.all_landmarks_as_dataframe()
        all_landmarks_df.to_csv(self._csvs_out_path, index=False)

    def class_names(self):
        return self._pose_class_names
    
    def all_landmarks_as_dataframe(self):
        """
        Merge all CSVs for each class into a single CSV file.
        """
        total_df = None
        for class_index, class_name in enumerate(self._pose_class_names):
            print(class_name)
            # // print class no
            print(class_index)

            csv_out_path = os.path.join(self._csvs_out_folder_per_class,
                                        class_name + '.csv')
            per_class_df = pd.read_csv(csv_out_path, header=None)
            
            # Add the labels
            per_class_df['class_no'] = [class_index] * len(per_class_df)
            per_class_df['class_name'] = [class_name] * len(per_class_df)
            
            # Append the folder name to the filename in the first column
            per_class_df[per_class_df.columns[0]] = class_name + '/' + per_class_df[per_class_df.columns[0]]
            
            if total_df is None:
                total_df = per_class_df
            else:
                total_df = pd.concat([total_df, per_class_df], axis=0)
        
        # Rename headers
        header_name = ['filename'] + [f'{bodypart.name}_{suffix}'
                                      for bodypart in BodyPart
                                      for suffix in ['x', 'y', 'score']]
        header_map = {total_df.columns[i]: header_name[i] for i in range(len(header_name))}
        
        total_df.rename(header_map, axis=1, inplace=True)
        
        return total_df

# Preprocess training data
images_in_folder = os.path.join('yoga_poses', 'train')
csvs_out_path = 'train_data.csv'
train_preprocessor = Preprocessor(images_in_folder, csvs_out_path)
train_preprocessor.process()

# Preprocess testing data
images_in_folder = os.path.join('yoga_poses', 'test')
csvs_out_path = 'test_data.csv'
test_preprocessor = Preprocessor(images_in_folder, csvs_out_path)
test_preprocessor.process()
