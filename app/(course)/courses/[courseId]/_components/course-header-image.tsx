import Image from "next/image";

interface CourseHeaderImageProps {
  title: string;
  imageUrl: string;
}

export const CourseHeaderImage = ({
  title,
  imageUrl
}: CourseHeaderImageProps) => {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden">
      <Image
        fill
        className="object-cover"
        alt={title}
        src={imageUrl}
      />
    </div>
  );
};