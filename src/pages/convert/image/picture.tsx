import Head from "next/head";

import { useState } from "react";

type Props = {
  toPicture: (url: string[]) => void;
};

const ImageUploader = ({ toPicture }: Props) => {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const urls: string[] = [...fileUrls];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    toPicture(fileUrls);
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      const file = files[i];
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        urls.push(reader.result as string);
        setFileUrls(urls);
      };
    }
  };

  const removeImage = (index: number) => {
    const newUrls = fileUrls.filter((_, i) => i !== index);
    setFileUrls(newUrls);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="file"
          onChange={handleFileInputChange}
          accept="image/*"
          multiple
        />
      </div>
      <div className="mt-2 flex flex-row flex-wrap">
        {fileUrls.map((url, index) => { 
          console.log('render')
          return(
          <div key={index} className="m-1 relative">
            <div
              className="absolute right-1 top-1 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              onClick={() => removeImage(index)}
            >
              x
            </div>
            <img src={url} alt="uploaded" className="max-h-32" />
          </div>
        )})}
      </div>
      <div className="mt-2">
        <button type="submit" disabled={fileUrls.length === 0 }>
          Submit
        </button>
      </div>
    </form>
  );
};


export default function Home() {
  const handleToPicture = async (urls: string[]) => {
    const reqest = await fetch("/api/gridImage?images=" + encodeURIComponent(JSON.stringify(urls)));
    console.log(await reqest.json());
  };

  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>My App</title>
      </Head>

      <main>
        <h1 className="text-4xl font-bold text-center my-8">My App</h1>
        <ImageUploader toPicture={handleToPicture} />
      </main>
    </div>
  );
}
