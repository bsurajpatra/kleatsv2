"use client";
import React from "react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white shadow-md z-10 p-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-red-600">KL Eats - Contact Us</h1>
        <p className="text-sm text-gray-600">Support & Feedback Center</p>
      </header>

      {/* Hero Section */}
      <section className="bg-red-50 py-10 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-red-700 mb-4">
          Need Help? We’re Here 24/7!
        </h2>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Reach out for queries, platform issues, or to become a contributor at KL Eats — your all-in-one campus food solution!
        </p>
      </section>

      {/* Support Features Section */}
      <section className="py-10 px-6 bg-white">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Why Contact Us?</h3>
        <ul className="space-y-4 text-lg">
          <li> Fast response to all user queries</li>
          <li>Direct support from KL GLUG members at Room C424</li>
          <li>24/7 technical support for platform issues</li>
          <li> Want to contribute? We’ll guide you</li>
          <li>Suggestions? Help us improve the experience</li>
          <li>Live updates on menus and service</li>
          <li>Issues with food, service, payments? We’ve got you!</li>
        </ul>
      </section>

      {/* Membership & Contribution */}
      <section className="py-10 px-6 bg-gray-50">
        <h3 className="text-2xl font-semibold mb-4">Join Us or Contribute</h3>
        <p className="mb-4">
          To become a member or contribute to KL Eats, visit:
          <a
            href="https://kleats.in/member"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 underline ml-1"
          >
            kleats.in/member
          </a>
          {" "}or visit Room C424.
        </p>
      </section>

      {/* Contact Box */}
      <section className="bg-red-100 p-6 mt-6 rounded-lg shadow mx-4">
        <h3 className="text-xl font-semibold mb-2 text-red-700">Still Have Questions?</h3>
        <p>Drop your queries anytime, and we’ll ensure you get the best support possible. Your experience matters to us!</p>
        <p className="mt-4">
          📩 Email: <a href="mailto:support@kleats.in" className="text-blue-700 underline">support@kleats.in</a><br />
          📍 Location: KL University, GLUG Room C424, Vijayawada
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-10">
        &copy; {new Date().getFullYear()} KL Eats : A Unit of Equitech Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
