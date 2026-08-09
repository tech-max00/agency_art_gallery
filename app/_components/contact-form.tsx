"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(String(data.get("subject") || "Gallery enquiry"));
    const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
    setSent(true);
    window.location.href = `mailto:studio@arcform.gallery?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <label><span>YOUR NAME</span><input name="name" required autoComplete="name" placeholder="FULL NAME" /></label>
      <label><span>EMAIL ADDRESS</span><input name="email" required type="email" autoComplete="email" placeholder="YOU@EMAIL.COM" /></label>
      <label><span>SUBJECT</span><select name="subject" defaultValue="General gallery enquiry"><option>General gallery enquiry</option><option>Artwork enquiry</option><option>Private visit</option><option>Press and partnerships</option></select></label>
      <label className="message-field"><span>YOUR MESSAGE</span><textarea name="message" required rows={6} placeholder="TELL US HOW WE CAN HELP" /></label>
      <button type="submit">{sent ? "OPENING YOUR EMAIL…" : "SEND ENQUIRY ↗"}</button>
    </form>
  );
}
