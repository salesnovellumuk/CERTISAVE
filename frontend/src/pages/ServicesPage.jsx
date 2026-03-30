// src/pages/ServicesPage.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const serviceData = [
  {
    id: 1,
    title: "*Service Title 1*",
    category: "*Category 1*",
    description: "*Description for service 1 goes here*",
    link: "#"
  },
  {
    id: 2,
    title: "*Service Title 2*",
    category: "*Category 2*",
    description: "*Description for service 2 goes here*",
    link: "#"
  },
  {
    id: 3,
    title: "*Service Title 3*",
    category: "*Category 3*",
    description: "*Description for service 3 goes here*",
    link: "#"
  }
];

const ServicesPage = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-light text-gray-800 text-center mb-16">
          *Your Services Heading*
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceData.map((service) => (
            <div 
              key={service.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-gray-600 mb-6">
                {service.description}
              </p>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {service.category}
                </p>
                <a 
                  href={service.link} 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;