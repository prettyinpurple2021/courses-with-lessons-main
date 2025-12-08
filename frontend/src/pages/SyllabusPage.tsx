import { useState } from 'react';
import { Link } from 'react-router-dom';
import { courses } from '../data/courseContent';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import DynamicMetaTags from '../components/common/DynamicMetaTags';

const SyllabusPage = () => {
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    const toggleCourse = (courseId: string) => {
        if (expandedCourse === courseId) {
            setExpandedCourse(null);
        } else {
            setExpandedCourse(courseId);
        }
    };

    return (
        <>
            <DynamicMetaTags
                title="Course Syllabus - SoloSuccess Intel Academy"
                description="Explore our comprehensive 7-course curriculum designed to take you from foundation to mastery. Detailed lesson breakdown for every course."
                keywords="course syllabus, business curriculum, female founders, entrepreneurship training, lesson plan"
            />
            <div className="min-h-screen relative overflow-hidden text-white">
                <CamoBackground variant="subtle" className="fixed inset-0 z-0" />

                <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6">
                                Bootcamp <span className="text-hot-pink">Syllabus</span>
                            </h1>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                A complete breakdown of our military-grade business training program.
                                7 Courses. 84 Lessons. Infinite Potential.
                            </p>
                        </div>

                        {/* Course List */}
                        <div className="space-y-8">
                            {courses.map((course) => (
                                <GlassmorphicCard key={course.id} className="relative overflow-hidden transition-all duration-300 hover:border-hot-pink/30">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Course Info Header */}
                                        <div className="md:w-1/3 space-y-4">
                                            <div className="inline-block px-4 py-1 rounded-full bg-hot-pink/20 border border-hot-pink/50 text-hot-pink font-bold text-sm">
                                                Course {course.courseNumber}
                                            </div>
                                            <h2 className="text-3xl font-bold">{course.title}</h2>
                                            <p className="text-gray-300 leading-relaxed">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    ⏱️ {course.duration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    📚 {course.lessonsCount} Lessons
                                                </span>
                                            </div>
                                            <div className="pt-4">
                                                 <div className="flex gap-4">
                                                    <GlassmorphicButton
                                                        variant="outline"
                                                        onClick={() => toggleCourse(course.id)}
                                                    >
                                                        {expandedCourse === course.id ? 'Hide Syllabus' : 'View Syllabus'}
                                                    </GlassmorphicButton>
                                                     <Link to="/register">
                                                        <GlassmorphicButton variant="primary">
                                                            Enroll Now
                                                        </GlassmorphicButton>
                                                     </Link>
                                                 </div>
                                            </div>
                                        </div>

                                        {/* Syllabus List (Collapsible/Transitioned) */}
                                        <div className={`md:w-2/3 ${expandedCourse === course.id ? 'block' : 'hidden md:block'}`}>
                                             <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                                <h3 className="text-xl font-bold mb-4 text-hot-pink">Course Curriculum</h3>
                                                <div className="grid gap-3">
                                                    {course.syllabus.map((lesson, index) => (
                                                        <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-hot-pink">
                                                                {index + 1}
                                                            </div>
                                                            <div className="text-gray-200">
                                                                {lesson}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassmorphicCard>
                            ))}
                        </div>

                         {/* Bottom CTA */}
                         <div className="text-center mt-20">
                            <GlassmorphicCard className="max-w-4xl mx-auto py-12 px-8">
                                <h2 className="text-3xl font-bold mb-6">Ready to Report for Duty?</h2>
                                <p className="text-xl text-gray-300 mb-8">
                                    Join the ranks of successful female founders who have transformed their businesses with this curriculum.
                                </p>
                                <Link to="/register">
                                    <GlassmorphicButton size="lg" variant="primary" className="holographic-hover">
                                        Start Your Training Today
                                    </GlassmorphicButton>
                                </Link>
                            </GlassmorphicCard>
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SyllabusPage;
