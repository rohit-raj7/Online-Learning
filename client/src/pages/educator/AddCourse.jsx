
import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import Quill from 'quill';
import uniqid from 'uniqid';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import VideoUpload from './VideoUpload'; // ✅ Updated import
import { useParams } from 'react-router-dom';

const AddCourse = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { API_URL } = useContext(AppContext);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTimeLeft, setUploadTimeLeft] = useState(0);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      toast.error('Thumbnail Not Selected');
      setLoading(false);
      return;
    }

    const courseData = {
      courseTitle,
      courseDescription: quillRef.current.root.innerHTML,
      coursePrice: Number(coursePrice),
      discount: Number(discount),
      courseContent: chapters,
    };

    const formData = new FormData();
    formData.append('courseData', JSON.stringify(courseData));
    formData.append('image', image);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/api/educator/add-course`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll bg-gray-800 flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-200'>
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            className='outline-none md:py-2.5 py-2 px-3 rounded bg-gray-800 border border-green-500'
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <p>Course Description</p>
          <div className='bg-gray-800 border border-green-400' ref={editorRef}></div>
        </div>

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border bg-slate-800 border-green-300'
              required
            />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} alt='' className='p-3 bg-blue-500 rounded' />
              <input type='file' id='thumbnailImage' onChange={(e) => setImage(e.target.files[0])} accept='image/*' hidden />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : ''} alt='' />
            </label>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder='0'
            min={0}
            max={100}
            className='outline-none bg-slate-800 md:py-2.5 py-2 w-28 px-3 rounded border border-green-300'
            required
          />
        </div>

        {/* Chapters & Lectures */}
        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className='bg-gray-800 text-gray-100 border border-green-300 rounded-lg mb-4'>
              <div className='flex justify-between bg-gray-800 items-center p-4 border-b'>
                <div className='flex items-center bg-gray-800'>
                  <img
                    className={`mr-2 cursor-pointer transition-all ${chapter.collapsed ? '-rotate-90' : ''}`}
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=''
                  />
                  <span className='font-semibold text-gray-200'>
                    {chapterIndex + 1} {chapter.chapterTitle}
                  </span>
                </div>
                <span className='text-gray-300'>{chapter.chapterContent.length} Lectures</span>
                <img onClick={() => handleChapter('remove', chapter.chapterId)} src={assets.cross_icon} alt='' className='cursor-pointer' />
              </div>
              {!chapter.collapsed && (
                <div className='p-4 bg-gray-800'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className='flex justify-between items-center mb-2 text-gray-200'>
                      <span>
                        {lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a href={lecture.lectureUrl} target='_blank' rel='noreferrer' className='text-blue-500'>
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} src={assets.cross_icon} alt='' className='cursor-pointer' />
                    </div>
                  ))}
                  <div className='inline-flex bg-green-500 p-2 rounded cursor-pointer mt-2' onClick={() => handleLecture('add', chapter.chapterId)}>
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className='flex justify-center text-black items-center bg-green-500 p-2 rounded-lg cursor-pointer' onClick={() => handleChapter('add')}>
            + Add Chapter
          </div>

          {/* Popup for adding lecture */}
          {showPopup && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
              <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>
                <input type='text' placeholder='Lecture Title' value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })} className='block w-full border rounded py-1 px-2 mb-2' />
                <input type='number' placeholder='Duration (minutes)' value={lectureDetails.lectureDuration} onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })} className='block w-full border rounded py-1 px-2 mb-2' />

                {/* ✅ Video Upload */}
                <VideoUpload
                  setLectureDetails={setLectureDetails}
                  setUploadProgress={setUploadProgress}
                  setUploadTimeLeft={setUploadTimeLeft}
                />

                {uploadProgress > 0 && (
                  <div className='mb-2'>
                    <div className='h-2 bg-gray-200 rounded-full'>
                      <div className='h-full bg-blue-600 rounded-full' style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className='text-sm mt-1'>{uploadProgress}% uploaded - {uploadTimeLeft}s left</p>
                  </div>
                )}

                {lectureDetails.lectureUrl && (
                  <div className='mt-2'>
                    <p className='text-sm font-medium'>Video URL:</p>
                    <a href={lectureDetails.lectureUrl} target='_blank' rel='noreferrer' className='text-blue-600 break-all text-sm underline'>
                      {lectureDetails.lectureUrl}
                    </a>
                    <video controls className='w-full mt-2 rounded'>
                      <source src={lectureDetails.lectureUrl} type='video/mp4' />
                    </video>
                  </div>
                )}

                <div className='flex items-center gap-2 my-3'>
                  <label>Free Preview?</label>
                  <input
                    type='checkbox'
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                    className='scale-125'
                  />
                </div>
                <button onClick={addLecture} type='button' className='w-full bg-blue-500 text-white py-2 rounded'>Add</button>
                <img src={assets.cross_icon} alt='close' onClick={() => setShowPopup(false)} className='absolute top-4 right-4 w-4 cursor-pointer' />
              </div>
            </div>
          )}
        </div>

        <button type='submit' className='bg-blue-500 text-white w-max py-2.5 px-8 rounded my-4' disabled={loading}>
          {loading ? 'Adding...' : 'ADD'}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;