import React from "react";
import { Link } from "wouter";
import { IoIosOpen } from "react-icons/io";

export default function WorkOrderEditButton({ id, basePath = "/details" }) {
  if (id === undefined || id === null) return null;

  const href = `${basePath}?id=${encodeURIComponent(id)}`;

  return (
    <Link href={href} className="wo__table-button " aria-label={`Editar orden #${id}`} onClick={(event) => event.stopPropagation()}>
      <IoIosOpen/>
    </Link>
  );
}