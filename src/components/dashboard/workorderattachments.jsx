import React, { useRef, useState } from "react";
import { formatFileSize, isImageAttachment, isPdfAttachment } from "../../data/attachments.data.js";
import { formatDate } from "../../data/workorders.data.js";

export default function WorkOrderAttachments({ attachments, onUpload, onDelete, uploading, disabled }) {
	const fileInputRef = useRef(null);
	// Confirmación de borrado en dos pasos (evita window.confirm nativo,
	// que se ve feo/inconsistente entre desktop y celular).
	const [confirmingId, setConfirmingId] = useState(null);

	const handlePickFile = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event) => {
		const file = event.target.files?.[0];
		if (file) onUpload(file);
		event.target.value = ""; // permite volver a elegir el mismo archivo
	};

	const handleDeleteClick = (id) => {
		if (confirmingId === id) {
			onDelete(id);
			setConfirmingId(null);
		} else {
			setConfirmingId(id);
		}
	};

	return (
		<div className="wod__attachments">

			<div className="wod__attachments-header">
				<span className="wod__label">Adjuntos ({attachments.length})</span>

				<button type="button" className="wod__button wod__button--upload" onClick={handlePickFile} disabled={disabled || uploading}>
					{uploading ? "Subiendo…" : "+ Adjuntar archivo"}
				</button>

				<input
					ref={fileInputRef}
					type="file"
					accept="application/pdf,image/*"
					className="wod__file-input"
					onChange={handleFileChange}
				/>
			</div>

			{attachments.length === 0 ? (
				<div className="wod__attachments-empty">Sin archivos adjuntos.</div>
			) : (
				<ul className="wod__attachments-list">
					{attachments.map((attachment) => (
						<li key={attachment.id} className="wod__attachment">

							<div className="wod__attachment-preview">
								{isImageAttachment(attachment.file_type) && attachment.url ? (
									<img src={attachment.url} alt={attachment.file_name} className="wod__attachment-thumb" />
								) : (
									<span className={`wod__attachment-badge ${isPdfAttachment(attachment.file_type) ? "wod__attachment-badge--pdf" : ""}`}>
										{isPdfAttachment(attachment.file_type) ? "PDF" : "ARCH"}
									</span>
								)}
							</div>

							<div className="wod__attachment-info">
								{attachment.url ? (
									<a href={attachment.url} target="_blank" rel="noreferrer" className="wod__attachment-name">
										{attachment.file_name}
									</a>
								) : (
									<span className="wod__attachment-name">{attachment.file_name}</span>
								)}
								<span className="wod__attachment-meta">
									{formatFileSize(attachment.file_size)} · {formatDate(attachment.uploaded_at)}
								</span>
							</div>

							<button
								type="button"
								className={`wod__button wod__button--delete ${confirmingId === attachment.id ? "wod__button--delete-confirm" : ""}`}
								onClick={() => handleDeleteClick(attachment.id)}
								disabled={disabled}
							>
								{confirmingId === attachment.id ? "¿Confirmar?" : "Eliminar"}
							</button>

						</li>
					))}
				</ul>
			)}

		</div>
	);
}