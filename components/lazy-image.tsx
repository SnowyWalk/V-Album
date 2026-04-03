"use client";

import Image, {ImageProps} from "next/image";
import {useState} from "react";

function getPreviewSrc(src: string): string {
    const lastDot = src.lastIndexOf(".");
    const srcWithoutFormat = lastDot !== -1 ? src.substring(0, lastDot) : src;
    return `${srcWithoutFormat}_thumb.webp`;
}

type LazyImageProps = Omit<ImageProps, "src"> & {
    src: string;
};

export default function LazyImage({src, ...props}: LazyImageProps) {
    const [currentSrc, setCurrentSrc] = useState(getPreviewSrc(src));

    return (
        <>
            <Image
                alt={props.alt || ""}
                {...props}
                src={currentSrc}
                onLoad={() => {
                    if (currentSrc !== src) {
                        setCurrentSrc(src);
                    }
                }}
                onError={() => {
                    if (currentSrc !== src) {
                        setCurrentSrc(src);
                    }
                }}
            />
        </>
    );
}