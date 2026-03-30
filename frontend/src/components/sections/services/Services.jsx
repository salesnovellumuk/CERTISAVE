import React from 'react';
import { ChevronRight } from 'lucide-react';
import './styles/services.css';


// Example service data - replace with your own
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

const Services = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceData.map((service) => (
            <div 
              key={service.id} 
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Content */}
              <div className="space-y-4">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {service.category}
                </p>
                <h3 className="text-xl font-semibold">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
                <a 
                  href={service.link} 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  Explore Service
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

export default Services;