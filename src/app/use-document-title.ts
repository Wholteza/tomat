import { useEffect } from "react";

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    if (document.title === title) return;
    document.title = title;
  }, [title]);
};

export default useDocumentTitle;
