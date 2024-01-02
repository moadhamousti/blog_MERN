import ReactQuill from "react-quill";

export default function Editor({value,onChange}) {
const modules = {
    toolbar: [
        [{ 'header': [1, 2, false]}], 
        ['bold', 'underline','strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{'script':'sub'}, {'script':'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [ 'link', 'image' ],
    ]};
    
    const formats = {
    toolbar: [
        'header', 
        'bold', 'italic', 'underline','strike','blockquote',
        'list', 'bullet','indent',
        'link', 'image',
    ]};

  return (
    <div className="content">
    <ReactQuill
      value={value}
      theme={'snow'}
      onChange={onChange}
      modules={modules} 
      formats={formats}/> 
    </div>
  );
}