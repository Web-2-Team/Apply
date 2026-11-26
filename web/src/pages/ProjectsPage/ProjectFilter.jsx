import { useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";

function ProjectFilter({ label, value, options, onChange }) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listId = `${id}-options`;
  const fieldRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    listRef.current.focus({ preventScroll: true });

    function dismissOutside(event) {
      if (!fieldRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = list.children[activeIndex];
    if (!option) return;

    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [open, activeIndex]);

  function openList() {
    setActiveIndex(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function closeList() {
    buttonRef.current.focus();
    setOpen(false);
  }

  function selectOption(index) {
    onChange(options[index]);
    closeList();
  }

  function handleKeyboard(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectOption(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        closeList();
        break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const letter = event.key.toLowerCase();
        const indexAfter = options.findIndex((option, index) => index > activeIndex && option.toLowerCase().startsWith(letter));
        const match = indexAfter === -1 ? options.findIndex((option) => option.toLowerCase().startsWith(letter)) : indexAfter;
        if (match !== -1) {
          event.preventDefault();
          setActiveIndex(match);
        }
      }
    }
  }

  return (
    <div className="projects-filter">
      <span id={labelId}>{label}</span>
      <div
        className="projects-filter-select"
        ref={fieldRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          className="projects-filter-trigger"
          aria-labelledby={`${labelId} ${valueId}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => open ? closeList() : openList()}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              openList();
            }
          }}
        >
          <span id={valueId}>{value}</span>
          <FiChevronDown aria-hidden="true" />
        </button>
        {open && (
          <ul
            ref={listRef}
            id={listId}
            className="projects-filter-options"
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={handleKeyboard}
          >
            {options.map((option, index) => (
              <li
                key={option}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option === value}
                data-active={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                <span>{option}</span>
                {option === value && <FiCheck aria-hidden="true" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProjectFilter;
