import React, { useContext } from "react";
import "./assets/scss/App.scss";
import AppContext from "./components/hooks/createContext";
import MaskList from "./components/MaskList";
import HuggingImageUpload from "./components/HuggingImageUpload";
import "./Hugging.scss";
const App = () => {
  const {
    maskList: [, setMaskList],
    loading: [loading, setLoading],
    huggingImage: [huggingImage],
  } = useContext(AppContext)!;

  const loadFile = async ({ data }: any) => {
    setLoading(true);
    try {
      setMaskList(data);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="app_wrapper">
      <HuggingImageUpload
        setLoading={setLoading}
        loading={loading}
        loadFile={loadFile}
        uploadURL={"/hugging_face_save_image"}
      />
      <div className="hugging_wrapper_content">
        {huggingImage && (
          <img src={huggingImage as any} alt="" className="hugging_img" />
        )}
        <div className="app_right">
          <MaskList />
        </div>
      </div>
    </div>
  );
};

export default App;
