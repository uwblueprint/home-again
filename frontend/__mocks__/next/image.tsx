import React from "react";
import { ImageProps } from "next/image";

const NextImageMock = ({ src, alt, width, height, className }: ImageProps) => (
  <img src={src as string} alt={alt} width={width} height={height} className={className} />
);

export default NextImageMock;
