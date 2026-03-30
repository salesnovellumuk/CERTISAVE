import React from 'react';
import './styles/reviews.css';


// Example review data - replace with your own
const reviews = [
  {
    id: 1,
    name: "*Name*",
    role: "*Title/Company*",
    text: "*Add your review text here*"
  },
  {
    id: 2,
    name: "*Name*",
    role: "*Title/Company*",
    text: "*Add your review text here*"
  },
  {
    id: 3,
    name: "*Name*",
    role: "*Title/Company*",
    text: "*Add your review text here*"
  }
];

const Reviews = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-light text-gray-800 text-center mb-16">
          *Your Reviews Heading*
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-gray-600 mb-6">
                {review.text}
              </p>
              
              <div className="border-t pt-4">
                <p className="font-medium text-gray-800">
                  {review.name}
                </p>
                <p className="text-sm text-gray-500">
                  {review.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;