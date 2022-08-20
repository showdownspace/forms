import clsx from "clsx";
import { createTypeHelper } from "create-type-helper";
import { NextPage } from "next";
import Head from "next/head";
import { FC, Fragment, ReactNode, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Layout } from "../layout";

export function createFormPage(f: FormLogic): NextPage {
  return function FormPage() {
    const [state, setState] = useState<Record<string, any>>({});
    let elements: JSX.Element[] = [];
    const push = (node: ReactNode) => {
      elements.push(<Fragment key={elements.length}>{node}</Fragment>);
    };
    const builder: FormBuilder = {
      ask(text) {
        push(
          <blockquote className="blockquote">
            <ReactMarkdown>{text}</ReactMarkdown>
          </blockquote>
        );
      },
      explain(text) {
        push(
          <div className="text-muted">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        );
      },
      say(text) {
        push(
          <div>
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        );
      },
      fill(id) {
        push(
          <InputZone>
            <input
              type="text"
              className="form-control"
              id={id}
              placeholder=""
              value={state[id]}
              onChange={(e) => {
                setState({ ...state, [id]: e.target.value });
              }}
              required
            />
          </InputZone>
        );
        return state[id] || "";
      },
      choose(id, choices) {
        push(
          <InputZone>
            {Object.entries(choices).map(([value, text]) => (
              <Radio
                key={value}
                name={id}
                value={value}
                checked={state[id] === value}
                onChange={() => {
                  setState({ ...state, [id]: value });
                }}
              >
                {text}
              </Radio>
            ))}
          </InputZone>
        );
        return state[id];
      },
      section(title, build) {
        const oldElements = elements;
        elements = [];
        try {
          let completed = false;
          build({
            markAsCompleted() {
              completed = true;
            },
          });
          oldElements.push(
            <div className={clsx("card mb-4", completed && "border-success")}>
              <div
                className={clsx(
                  "card-header",
                  completed &&
                    "bg-success bg-opacity-25 border-success border-opacity-50"
                )}
              >
                {title}
              </div>
              <div className="card-body">{elements}</div>
            </div>
          );
        } finally {
          elements = oldElements;
        }
      },
    };
    f(builder);
    return <Layout>{elements}</Layout>;
  };
}

const InputZone: FC<{ children: ReactNode }> = (props) => {
  return (
    <div className="row mb-4 align-items-baseline">
      <div className="col-2 col-sm-1 text-end fs-5">👉</div>
      <div className="col-10 col-sm-11">{props.children}</div>
    </div>
  );
};

const Radio: FC<{
  children: ReactNode;
  name: string;
  value: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = (props) => {
  const id = useId();
  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        id={id}
      />
      <label className="form-check-label" htmlFor={id}>
        {props.children}
      </label>
    </div>
  );
};

type FormLogic = (form: FormBuilder) => void;

interface FormBuilder {
  say(text: string): void;
  ask(text: string): void;
  explain(text: string): void;
  fill(id: string): string;
  choose<T extends Record<string, string>>(
    id: string,
    choices: T
  ): keyof T | undefined;
  section(title: string, build: (section: SectionBuilder) => void): void;
}

interface SectionBuilder {
  markAsCompleted(): void;
}

export const defineForm = createTypeHelper<FormLogic>();
