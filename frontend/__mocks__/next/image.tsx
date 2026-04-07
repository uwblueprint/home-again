import React from "react";
import type { ImageProps } from "next/image";

const NextImageMock = ({ src, alt, width, height, className }: ImageProps) => (
  <img src={src as string} alt={alt} width={width as number | undefined} height={height as number | undefined} className={className} />
);

export default NextImageMock;
