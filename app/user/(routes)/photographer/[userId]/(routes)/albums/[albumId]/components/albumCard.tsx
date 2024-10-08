import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, MoreVertical } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Album, AlbumImage } from "@/app/lib/types";
import Masonry from "react-masonry-css";
import fileDownload from "js-file-download";
import axios from "axios";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { NotificationService } from "@/components/notification/notification";
import { useSession } from "next-auth/react";
import PayNow from "@/components/checkout/PayAlbum";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AlbumCardProps = {
  albumData: Album[];
  isPhotographer: boolean;
  deleteAlbums: (id: string) => void;
};

const AlbumCard: React.FC<AlbumCardProps> = ({
  albumData,
  isPhotographer,
  deleteAlbums,
}) => {
  const { data: session } = useSession();
  const [status, setStatus] = useState<String>();
  const { userId } = useParams();

  if (!isPhotographer) {
    albumData = albumData.filter((album) => album.visibility === "PUBLIC");
  }

  const fetchPaymentStatus = async (albumId: string | undefined) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/photographer/${session?.user?.id}/${albumId}/getStatus`
      );
      setStatus(res.data.status);
    } catch (error) {
      toast.error("Error fetching payment status");
    }
  };

  const generateZip = async () => {};

  const handleDownload = async (album: Album) => {
    fetchPaymentStatus(album.id);

    const { images, id } = album;
    const zip = new JSZip();

    // Create a promise for each image download
    const promises = images.map(async (image, index) => {
      if (isPhotographer || status === "PAID" || album.price === 0) {
        try {
          const response = await axios.get(image.image, {
            responseType: "blob",
          });

          // Add the downloaded image to the zip file
          zip.file(`${index + 1}_${image.id}.jpg`, response.data);
        } catch (error) {
          toast.error("Error downloading images");
        }
      } else {
        const parts = image.image.split("/upload/");

        let modifiedUrl = `${parts[0]}/upload/w_400,f_auto,q_auto/l_text:helvetica_50_bold:Anothershot,g_north,y_100,o_50/${parts[1]}`;

        try {
          const response = await axios.get(modifiedUrl, {
            responseType: "blob",
          });

          // Add the downloaded image to the zip file
          zip.file(`${index + 1}_${image.id}.jpg`, response.data);
        } catch (error) {
          toast.error("Error downloading images");
        }
      }
    });

    await Promise.all(promises);

    // Generate the zip file
    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        fileDownload(content, `${id}.zip`);
        toast.success("Album downloaded successfully");
        NotificationService({
          senderId: session?.user.id,
          receiverId: album.photographerId,
          type: "Album",
          title: "downloaded your album",
          description: `downloaded album ${album.name} successfully`,
        });
      })
      .catch((error) => {
        toast.error("Error generating zip file");
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-[2rem] ">
      {albumData.length === 0
        ? <p className="absolute right-1/2 md:text-xl text-sm">No Albums yet</p>
        : albumData.map((album) => (
            <Card
              key={album.id}
              className="w-full h-[300px] sm:h-[400px]  xl:h-[30rem] mb-9 mx-auto rounded-[40px] overflow-hidden relative "
            >
              <Link
                href={{
                  pathname: `albums/${album.id}`,
                  query: {
                    view: false,
                  },
                }}
              >
                <Image
                  src={album.coverImage || "/images/albumcover.png"}
                  alt="album cover"
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-110 transform transition duration-500 ease-in-out"
                />
              </Link>
              <>
                {album.images.length !== 0 && 
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="absolute top-4 left-5 bg-slate-950 bg-opacity-45 px-2 py-2 rounded-full text-white"><Images height={15} width={15}/></TooltipTrigger>
                    <TooltipContent>
                      <p>{`${album.images.length} images`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
                <div className="absolute top-4 right-5 bg-slate-950 bg-opacity-45 rounded-full px-2 text-white text-xs">
                  {album.price !== 0 ? "PREMIUM" : "FREE"}
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-t from-black to-transparent rounded-b-[40px] p-4 flex items-center justify-between">
                  <div className="flex flex-col justify-center">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {album.name}
                          </h3>
                          <p className="text-sm text-white">
                            {album.description.slice(0, 30)}
                          </p>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="h-auto w-60">
                        <h6 className="text-xl font-semibold">{album.name}</h6>
                        <p className="text-sm ">{album.description}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="flex space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical
                          size={32}
                          color="#ffffff"
                          strokeWidth={2.5}
                          className="cursor-pointer"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                          {isPhotographer && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger className="relative hover:bg-accent flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 pr-28">
                                  <span className="cursor-pointer">
                                    Delete Album
                                  </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure to delete this Album ?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently remove from your Albums.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteAlbums(album.id ?? "")
                                      }
                                    >
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <DropdownMenuItem>
                                <Link
                                  href={{
                                    pathname: `albums/${album.id}`,
                                    query: {
                                      view: true,
                                    },
                                  }}
                                >
                                  Edit Album
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Link
                              href={{
                                pathname: `albums/${album.id}`,
                                query: {
                                  view: false,
                                },
                              }}
                            >
                              View Album
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <button
                              onClick={() => {
                                handleDownload(album);
                              }}
                            >
                              Download Album
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {userId == session?.user.id || album.price === 0 || album.paymentStatus === "PAID" ? (
                              ""
                            ) : (
                              <PayNow
                                albumId={album.id}
                                name={album.name}
                                price={album.price}
                              />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </>
            </Card>
          ))}
    </div>
  );
};

export default AlbumCard;
