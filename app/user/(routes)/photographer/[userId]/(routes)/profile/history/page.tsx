"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/app/lib/types";
import toast from "react-hot-toast";

const History = () => {
  const [savedImages, setSavedImages] = useState<User[]>([]);
  const [likedImages, setLikedImages] = useState<User[]>([]);
  const { userId } = useParams();
  const router = useRouter();

  useEffect(() => {
    const getSavedImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${userId}/savedImages`
        );
        setSavedImages(response.data);
      } catch (error: any) {
        toast.error("Error fetching saved images:", error);
      }
    };
    getSavedImages();
  }, [userId]);

  useEffect(() => {
    const getLikedImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${userId}/likeImages`
        );
        setLikedImages(response.data);
      } catch (error: any) {
        toast.error("Error fetching liked images:", error);
      }
    };
    getLikedImages();
  }, [userId]);

  const handleRedirect = (photographerId: string) => {
    toast('Redirecting to photographer feed');
    router.push(`/user/photographer/${photographerId}/feed`)
  }


  return (

    <Tabs defaultValue="like" className="flex flex-col items-center w-auto mt-10 mx-6 md:mx-24 h-screen">
      <TabsList className="my-5 bg-slate-200">
        <TabsTrigger value="save" className="text-xs md:text-sm">
          Saved Photos
        </TabsTrigger>
        <TabsTrigger value="like" className="text-xs md:text-sm">
          Liked Photos
        </TabsTrigger>
      </TabsList>
      <Separator className="mb-2 h-0.5" />
      <TabsContent value="save" className="lg:w-2/3 w-auto min-w-full">
        <ScrollArea className="p-4  h-screen">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {savedImages.map((image) => (
              image.savedFeedImages.length === 0 ? (
                <div key={image.id} className="col-span-3 md:col-span-4">
                  <p className="text-gray-500 flex w-full items-center justify-center">No saved photos yet.</p>
                </div>
              ) : (
                image.savedFeedImages.map((savedImage) => (
                  <div
                    key={savedImage.id}
                    className="relative w-full"
                    style={{ paddingBottom: '100%' }}
                  >
                    <Image
                      src={savedImage.imageUrl}
                      alt="Background Image"
                      layout="fill"
                      objectFit="cover"
                      className="absolute inset-0 rounded-md transform transition duration-500 hover:scale-105"
                      onClick={() => handleRedirect(savedImage.photographerId)}
                    />
                  </div>
                ))
              )))}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="like" className="w-2/3 min-w-full h-screen">
        <ScrollArea className="p-4 h-screen">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {likedImages.map((image) =>
            (
              image.likedFeedImages.length === 0 ? (
                <div key={image.id} className="col-span-3 md:col-span-4">
                  <p className="text-gray-500 flex w-full items-center justify-center">No liked photos yet.</p>
                </div>
              ) : (
                image.likedFeedImages.map((likedImage) => (
                  <div
                    key={likedImage.id}
                    className="relative w-full"
                    style={{ paddingBottom: '100%' }}
                  >
                    <Image
                      src={likedImage.imageUrl}
                      alt="Background Image"
                      layout="fill"
                      objectFit="cover"
                      className="absolute inset-0 rounded-md transform transition duration-500 hover:scale-105"
                      onClick={() => handleRedirect(likedImage.photographerId)}
                    />
                  </div>
                ))
              )))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default History;