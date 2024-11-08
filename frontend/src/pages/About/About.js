import React from "react";

import "./About.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function About() {
  return (
    <div>
      <Header />
      <div className="about-container">
        <h1 className="about-heading">About</h1>
        <div className="about-main">
          <p className="about-content">
            lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in
          </p>
          <div className="developer-info">
            <h4>About Developers</h4>
            <p className="about-content">
              We are Yash Nimse & Aryan Shinde,We are Full Stack Developer, AI
              Enthusiastic, Content Creator, Tutor, We love to work with
              technology and love to share on my youtube channel, I hope this
              project will help you.
            </p>
            <h4>Contact</h4>
            <a href="#">
              <p className="about-content">Instagram</p>
            </a>
            <a href="#">
              <p className="about-content">LinkedIn</p>
            </a>
            <a href="#">
              <p className="about-content">GitHub</p>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
