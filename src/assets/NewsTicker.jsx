import React from 'react';

const NewsTicker = ({ items }) => {
  return (
    <div
      className="
        w-screen
        bg-[#111]
        text-yellow-400
        whitespace-nowrap
        overflow-hidden
        box-border
        px-4
        py-2
        mb-2
      "
    >
      <div
        className="
          inline-block
          pl-[100%]
          animate-news-ticker
        "
      >
        {items.map((item, index) => (
          <span
            key={index}
            className="
              inline-block
              mr-40
              font-bold
            "
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;