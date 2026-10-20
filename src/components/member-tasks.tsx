"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardCheck,
  FileSignature,
  Printer,
  MessageCircle,
} from "lucide-react";

const tasks = [
  {
    href: "/forms/liability",
    title: "Complete a guest release",
    text: "Review, initial and sign the equine activity release.",
    icon: FileSignature,
  },
  {
    href: "/forms/donation",
    title: "Submit a horse candidate",
    text: "Tell ENVET about a horse you would like to donate.",
    icon: FileSignature,
  },
  {
    href: "/account/pre-visit",
    title: "Manage my pre-visit checklist",
    text: "Save your preparation and return to it before your visit.",
    icon: ClipboardCheck,
  },
  {
    href: "/account/forms",
    title: "View or print my signed forms",
    text: "Open private receipts with your applied initials and signatures.",
    icon: Printer,
  },
  {
    href: "/blog",
    title: "Comment on or like the journal",
    text: "Join the conversation or share a guide with someone you know.",
    icon: MessageCircle,
  },
];
export function MemberTasks() {
  const [choice, setChoice] = useState(tasks[0].href);
  const router = useRouter();
  return (
    <section className="member-tasks" aria-labelledby="member-tasks-heading">
      <h2 id="member-tasks-heading">I need to…</h2>
      <form
        className="member-task-picker"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(choice);
        }}
      >
        <label htmlFor="member-task">Choose your next step</label>
        <div>
          <select
            id="member-task"
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
          >
            {tasks.map((task) => (
              <option value={task.href} key={task.href}>
                {task.title}
              </option>
            ))}
          </select>
          <button type="submit" className="action">
            Continue <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </form>
      <ul className="member-task-list">
        {tasks.map(({ href, title, text, icon: Icon }) => (
          <li key={href}>
            <Link href={href} prefetch={false}>
              <Icon size={23} aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
