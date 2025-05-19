import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export default function BackButton({
  onClick,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  return (
    <StyledWrapper className={className}>
      <button type={type} onClick={onClick} {...rest}>
        <svg
          height={16}
          width={16}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
        >
          <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z" />
        </svg>
        <span>{children}</span>
      </button>
    </StyledWrapper>
  );
}

BackButton.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

BackButton.defaultProps = {
  onClick: () => {},
  type: "button",
  className: "",
  children: "Back",
};

const StyledWrapper = styled.div`
  button {
    display: flex;
    height: 3em;
    width: 100px;
    align-items: center;
    justify-content: center;
    letter-spacing: 1px;
    transition: all 0.2s linear;
    cursor: pointer;
    border: none;
    background: #fff;
    box-shadow: 2px 2px 0px rgb(183, 183, 183);
    border-radius: 3px;
  }

  button > svg {
    margin: 0 5px;
    font-size: 20px;
    transition: all 0.4s ease-in;
  }

  button:hover > svg {
    transform: translateX(-5px) scale(1.2);
  }

  button:hover {
    box-shadow: 9px 9px 33px #d1d1d1, -9px -9px 33px #ffffff;
    transform: translateY(-2px);
  }
`;
