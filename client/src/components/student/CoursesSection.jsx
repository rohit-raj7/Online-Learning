

import React, { useContext, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from '../educator/Login-Signup/Loading'
const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="py-10 px-4 md:px-20 text-gray-200">
      {/* Hide scrollbar via CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-green-500">Learn from Real-World Pros</h2>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mb-6 mx-auto">
          Our instructors aren’t just teachers—they’re industry leaders. Start learning skills that matter in today’s job market.
        </p>
      </div>



      {/* ---------- Big Screen Display (Scrollable section) ---------- */}
      <div className="hidden lg:block relative w-full">
        <button
          onClick={scrollLeft}
          className="flex absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-green-600 hover:bg-green-700 rounded-full shadow-md"
        >
          <ChevronLeft className="text-white w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-6 pb-2"
        >
          {allCourses && allCourses.length > 0 ? (
            allCourses.map((course, index) => (
              <div
                key={index}
                className="min-w-[90%] sm:min-w-[280px] max-w-sm flex-shrink-0"
              >
                <CourseCard course={course} />
              </div>
            ))
          ) : (
            <div className='flex flex-row ml-[15.5rem] gap-4 mt-6'>  <span>Loading...</span>
              <p className="text-gray-400 " ><Loading /> </p>
            </div>
          )}
        </div>

        <button
          onClick={scrollRight}
          className="flex absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-green-600 hover:bg-green-700 rounded-full shadow-md"
        >
          <ChevronRight className="text-white w-5 h-5" />
        </button>
      </div>

      {/* ---------- Mobile and Tablet Display (Grid section) ---------- */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allCourses && allCourses.length > 0 ? (
            allCourses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          ) : (
            <div className='flex flex-row ml-[5rem] gap-4 '>  <span>Loading...</span>
              <p className="text-gray-400 " ><Loading /> </p>
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesSection;
