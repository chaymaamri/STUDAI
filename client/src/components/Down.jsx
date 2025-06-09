// Down.jsx
import React from 'react';
import styled from 'styled-components';

const Down = ({ href, filename }) => {
  return (
    <StyledWrapper>
      <a
        className="Btn"
        href={href}
        download={filename}
        target="_blank"
        rel="noreferrer"
      >
        <svg className="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 
            12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 
            14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 
            0 45.3l160 160z"/>
        </svg>
        <span className="icon2" />
        <span className="tooltip">Download</span>
      </a>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #fff;      /* Fond blanc */
    border: 2px solid #007bff;  /* Contour bleu */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .Btn:hover {
    background-color: #007bff;   /* Fond bleu au survol */
    border-color: #007bff;
  }

  .svgIcon {
    fill: #007bff;              /* Icône bleue */
    transition: fill 0.3s ease;
  }

  .Btn:hover .svgIcon {
    fill: #fff;                 /* Icône blanche au survol */
  }

  .icon2 {
    margin-top: 3px;            /* petit espace sous l'icône */
    width: 16px;
    height: 3px;
    background: #007bff;       /* petit trait bleu */
    transition: background 0.3s ease;
  }

  .Btn:hover .icon2 {
    background: #fff;          /* trait blanc au survol */
  }

  .tooltip {
    position: absolute;
    bottom: -35px;
    opacity: 0;
    background-color: #333;    /* fond sombre pour le tooltip */
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    pointer-events: none;
    font-size: 12px;
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }

  .Btn:hover .tooltip {
    opacity: 1;
  }
`;

export default Down;
