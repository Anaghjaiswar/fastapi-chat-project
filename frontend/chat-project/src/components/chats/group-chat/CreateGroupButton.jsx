import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export default function CreateGroupButton({
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
          viewBox="0 0 24 24"
        >
          {/* simple “group” icon */}
          <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4
                   v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span>{children}</span>
      </button>
    </StyledWrapper>
  );
}

CreateGroupButton.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

CreateGroupButton.defaultProps = {
  onClick: () => {},
  type: "button",
  className: "",
  children: "Create Group",
};

const StyledWrapper = styled.div`
  button {
    display: flex;
    align-items: center;
    height: 2.9em;
    padding: 0 1rem;
    border: none;
    background: #fff;
    box-shadow: 2px 2px 0px rgb(183, 183, 183);
    border-radius: 3px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s linear;
  }

  button > svg {
    margin-right: 0.5rem;
    fill: #333;
    transition: transform 0.3s ease, fill 0.3s ease;
  }

  button > span {
    font-size: 1rem;
    color: #333;
  }

  button:hover > svg {
    transform: scale(1.2);
    fill: #007bff;
  }

  button:hover {
    box-shadow: 9px 9px 33px #d1d1d1, -9px -9px 33px #ffffff;
    transform: translateY(-2px);
  }
`;
