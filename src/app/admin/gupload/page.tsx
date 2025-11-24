
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from '../../../../utils/supabase';
import imageCompression from "browser-image-compression";
import './page.css';



export default function GuploadPage() {
	const [user, setUser] = useState<any>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	useEffect(() => {
		const checkUser = async () => {
			try {
				const { data } = await supabase.auth.getUser();
				setUser(data?.user ?? null);
			} catch (err) {
				setUser(null);
			}
		};
		checkUser();
	}, []);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFiles(Array.from(e.target.files));
			setMessage(null);
		} else {
			setFiles([]);
		}
	};

	const handleUpload = async (e: FormEvent) => {
		e.preventDefault();
		if (!files || files.length === 0) {
			setMessage({ type: 'error', text: "Please select one or more files to upload." });
			return;
		}

		if (!user) {
			setMessage({ type: 'error', text: "You must be logged in to upload images." });
			return;
		}

		setUploading(true);
		setMessage(null);

		try {
			const { data: existingFiles, error: listError } = await supabase.storage.from('gallery').list();
			if (listError) throw listError;
			const existingNames = new Set((existingFiles || []).map((f: any) => f.name));

			const options = {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 1920,
				useWebWorker: true,
				initialQuality: 0.6,
			} as any;

			const uploaded: string[] = [];
			const skipped: string[] = [];

			for (const f of files) {
				try {
					if (existingNames.has(f.name)) {
						skipped.push(f.name);
						continue;
					}

					const compressedFile = await imageCompression(f, options);

					const { error: uploadError } = await supabase.storage.from('gallery').upload(f.name, compressedFile as any);
					if (uploadError) {
						skipped.push(f.name);
						continue;
					}

					uploaded.push(f.name);
				} catch (err) {
					skipped.push(f.name);
					continue;
				}
			}

			if (uploaded.length === 0 && skipped.length > 0) {
				setMessage({ type: 'error', text: `No new images uploaded. Skipped: ${skipped.join(', ')}` });
			} else {
				const successText = uploaded.length > 0 ? `Uploaded: ${uploaded.join(', ')}` : '';
				const skipText = skipped.length > 0 ? `Skipped (already exist or failed): ${skipped.join(', ')}` : '';
				const combined = [successText, skipText].filter(Boolean).join(' | ');
				setMessage({ type: 'success', text: combined });
			}
		} catch (error: any) {
			setMessage({ type: 'error', text: error?.message || 'An unknown error occurred.' });
		} finally {
			setUploading(false);
			setFiles([]);
			const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
			if (fileInput) fileInput.value = '';
		}
	};

	return (
		<div className="gupload-container">
			{!user ? (
				<div className="gupload-message">Please log in to access the upload page.</div>
			) : (
				<div className="gupload-card">
					<h1 className="gupload-title">Upload Image to Gallery</h1>
					<form onSubmit={handleUpload} className="gupload-form">
						<label htmlFor="file-input" className="gupload-label">Choose one or more images</label>
						<input id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} className="gupload-file" disabled={uploading} />
						{files.length > 0 && (
							<div className="gupload-selected">
								<strong>Selected:</strong> {files.map(f => f.name).join(', ')}
							</div>
						)}
						<button type="submit" disabled={uploading || files.length === 0} className="gupload-btn">
							{uploading ? 'Uploading...' : `Upload ${files.length > 0 ? files.length + ' Image(s)' : 'Images'}`}
						</button>
					</form>
					{message && (
						<div className={`gupload-feedback ${message.type === 'success' ? 'success' : 'error'}`}>
							{message.text}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

