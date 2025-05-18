import React from "react";
import styled from "styled-components";

const Next = ({ label = "Next", onClick, disabled }) => {
  return (
    <StyledWrapper>
      <button
        className={`cta ${disabled ? "disabled" : ""}`}
        onClick={onClick}
        disabled={disabled}
      >
        <span className="hover-underline-animation">{label}</span>
        <svg
          id="arrow-horizontal"
          xmlns="http://www.w3.org/2000/svg"
          width={30}
          height={10}
          viewBox="0 0 46 16"
        >
          <path
            id="Path_10"
            data-name="Path 10"
            d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
            transform="translate(30)"
          />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .cta {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 14px;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding-bottom: 7px;
    margin-top:9px;
  }

  .cta svg {
    margin-left: 15px;
    transform: translateX(-8px);
    transition: all 0.3s ease;
  }

  .cta:hover svg {
    transform: translateX(0);
  }

  .cta:active svg {
    transform: scale(0.9);
  }

  .cta.disabled {
    color: #aaa;
    cursor: not-allowed;
    pointer-events: none;
  }

  .cta.disabled .hover-underline-animation:after {
    background-color: #aaa;
  }

  .hover-underline-animation {
    position: relative;
    color: black;
  }

  .hover-underline-animation:after {
    content: "";
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #000000;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  .cta:hover .hover-underline-animation:after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

export default Next;
