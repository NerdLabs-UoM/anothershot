"use client"

import {Upload} from "lucide-react";
import {CldUploadWidget, CldUploadWidgetResults, CldUploadWidgetInfo} from "next-cloudinary";
import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {useRouter, useParams} from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {AlbumImage} from "@/app/lib/types";

interface AlbumImageProp {
    albumId: string | string[];
    onImageUpdate: (images: AlbumImage[]) => void;
}

const ImageUpload: React.FC<AlbumImageProp> = ({albumId, onImageUpdate}) => {
    const [image, setImage] = useState<AlbumImage[]>([]);
    const router = useRouter();
    const {userId} = useParams();
    const handleRefresh = () => {
        router.refresh();
    };

    useEffect(() => {
        onImageUpdate(image);
    }, [image]);

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${albumId}/getimages`
                );
                setImage(response.data);
            } catch (e) {
                console.error(e);
            }
        }

        fetchImages();
    }, []);
    return (
        <div>
            <CldUploadWidget
                onOpen={() => {
                }}
                onSuccess={(results: CldUploadWidgetResults) => {
                    const uploadedResult =
                        results.info as CldUploadWidgetInfo;
                    const imageURL = {
                        image: uploadedResult.secure_url,
                    };
                    console.log("image url", imageURL);

                    async function Upload() {
                        try {
                            await axios.post(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${albumId}/addimages`,
                                {
                                    images: imageURL,
                                    albumId: albumId,
                                }
                            );
                            console.log("image url", imageURL);
                            toast.success("Images uploaded successfully");

                        } catch (e) {
                            console.log("eroor is", e);
                            toast.error("Images uploading failed");
                        }
                    }

                    Upload();
                    handleRefresh();
                }}
                options={{
                    sources: ["local"],
                    googleApiKey: "<image_search_google_api_key>",
                    showAdvancedOptions: false,
                    cropping: false,
                    multiple: true,
                    maxFiles: 10,
                    defaultSource: "local",
                    resourceType: "image",
                    folder: `photographer/${userId}/albums/${albumId}`,
                    styles: {
                        palette: {
                            window: "#ffffff",
                            sourceBg: "#f4f4f5",
                            windowBorder: "#90a0b3",
                            tabIcon: "#000000",
                            inactiveTabIcon: "#555a5f",
                            menuIcons: "#555a5f",
                            link: "#000000",
                            action: "#000000",
                            inProgress: "#464646",
                            complete: "#000000",
                            error: "#cc0000",
                            textDark: "#000000",
                            textLight: "#fcfffd",
                        },
                    },

                }}

                uploadPreset="rahuz25t">
                {({open}) => {
                    return (
                        <Button variant="default" onClick={() => open()}>
                            <div className="flex gap-2 my-3">
                                <Upload size={20} color="#fff"/>
                                <span className="text-1xl">Upload</span>
                            </div>
                        </Button>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
}

export default ImageUpload;