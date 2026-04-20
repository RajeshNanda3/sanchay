import React from 'react'

const Contact = () => {
  return (
    <div className="contact-page p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-4">
          If you have any questions, feedback, or need assistance, please feel free to reach out to us. We are here to help!
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Email</h2>
            <p className="text-gray-600">
              <a href="mailto:support@sanchay.com" className="text-indigo-600 hover:underline">
                support@sanchay.com
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Phone</h2>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Contact