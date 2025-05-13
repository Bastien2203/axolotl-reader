import { useEffect, useState } from "react";
import JSZip from "jszip";
import { API_HOST, Publication } from "../../types";


export const useBookLoader = (book: Publication) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>("Loading book...");
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  useEffect(() => {
    const link = book.links.find((l) => l.rel === "acquisition");
    if (!link) throw new Error("No acquisition link found");

    const fetchUrl = link.type.startsWith("blob+")
      ? URL.createObjectURL(link.href as unknown as Blob)
      : API_HOST + link.href;

    let urls: string[] = [];

    fetch(fetchUrl, {
      headers: {
        Accept: link.type,
        "Content-Type": link.type,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch book");
        return res.blob();
      })
      .then(JSZip.loadAsync)
      .then((zip) => {
        const promises: Promise<string>[] = [];
        zip.forEach((_, file) => {
          if (/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
            promises.push(
              file.async("blob").then((blob) => {
                const url = URL.createObjectURL(blob);
                urls.push(url);
                return url;
              })
            );
          }
        });
        return Promise.all(promises);
      })
      .then((urls) => {
        setImages(urls);
        setObjectUrls(urls);
        setLoading(null);
      })
      .catch((err) => {
        console.error(err);
        setLoading("Failed to load book");
      });

    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
      if (fetchUrl.startsWith("blob:")) URL.revokeObjectURL(fetchUrl);
    };
  }, [book]);

  return { images, loading };
};
