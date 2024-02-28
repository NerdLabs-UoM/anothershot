import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import CarouselMessages from "./components/CarouselMessages";
import EditButton from "./components/EditButton";
import SubmitForm from "./components/SubmitForm";
import { Testimonial } from "@/app/lib/types";

// interface TestimonialsData {
//   id: string;
//   review: string;
//   rating: number;
//   visibility: 'PUBLIC' | 'PRIVATE';
//   client: {
//     id: string;
//     name: string;
//     user: {
//       image: string | null; 
//     };
//   };
// }

const TestMonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { userId } = useParams();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${userId}/profile/testimonials`);
        console.log(response.data);
        setTestimonials(response.data);
      } catch (error: any) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, [userId]);

  return (
    <div className="flex flex-col items-center w-full border-y border-transparent pb-40 pt-32">
      <EditButton
        testimonialsData={testimonials}
      />
       <CarouselMessages
        testimonialsData={testimonials}
      />
      <SubmitForm />
    </div>
  );
};

export default TestMonialsSection;
