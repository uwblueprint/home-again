import React from "react";
import { ImageProps } from "next/image";
import Image from 'next/image';

const NextImageMock = ({ src, alt, width, height, className }: ImageProps) => (
  <Image src={src as string} alt={alt} width={width} height={height} className={className} />
);

export default NextImageMock;
