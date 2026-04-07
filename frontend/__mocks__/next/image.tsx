import React from "react";
import type { ImageProps } from "next/image";

const NextImageMock = ({ src, alt, width, height, className }: ImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src as string} alt={alt} width={width as number | undefined} height={height as number | undefined} className={className} />
);

export default NextImageMock;
