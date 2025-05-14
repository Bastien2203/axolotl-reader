import { useEffect, useState } from "react";
import { useToast } from "../../contexts/ToastContext";

type SecureImageProps = {
  url: string;
  token: string;
  className?: string;
  alt?: string;
  height?: string;
  onClick?: () => void;
  aspectRatio?: string;
}

const SecureImage = (props: SecureImageProps) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let objectUrl: string;
    let isMounted = true;
    setLoading(true);
  
    fetch(props.url, {
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading image:", err);
        showToast({
          message: "Error loading image",
          type: "alert-error",
        });
        setLoading(false);
      });
  
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [props.url, props.token]);
  
  


  return <div className="overflow-clip" style={{ height: props.height, aspectRatio: props.aspectRatio ?? "3/4" }}>
    {loading
      ? <div className="animate-pulse w-full h-full bg-base-100 rounded-md" />
      : imgUrl && <img loading="lazy" src={imgUrl} alt={props.alt} className={props.className} onClick={props.onClick}  />
       
    }
  </div>
}

export default SecureImage