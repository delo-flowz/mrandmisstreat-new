"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";
import styles from "./contestantUpload.module.css";

export default function ContestantUpload() {
  const [name, setName] = useState("");
  const [contestantNumber, setContestantNumber] = useState("");
  const [votes, setVotes] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [state, setState] = useState("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }
    if (!contestantNumber.trim()) {
      setMessage("Contestant number is required.");
      return;
    }
    
    if (!state.trim()) {
      setMessage("State is required.");
      return;
    }


    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (file) {
        const bucket = "contestant-images"; // adjust to your bucket name if needed
        const filePath = `public/${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // get public url (API may differ slightly depending on supabase-js version)
        try {
          // v1/v2 compatibility attempt
          // v1: getPublicUrl returns { publicURL }
          // v2: getPublicUrl returns { data: { publicUrl } }
          const publicUrlRes: any = await supabase.storage.from(bucket).getPublicUrl(filePath as string);
          imageUrl = publicUrlRes?.data?.publicUrl || publicUrlRes?.publicURL || publicUrlRes?.publicUrl || null;
        } catch (err) {
          // fallback: construct URL if possible (may not work on private buckets)
          imageUrl = null;
        }
      }

      const insertObj: any = {
        name: name.trim(),
        contestant_number: Number(contestantNumber),
        votes: Number(0),
        state: state.trim(),
        year: 2025,
      };
      if (imageUrl) insertObj.image = imageUrl;

      const { data, error } = await supabase.from("contestant").insert([insertObj]);
      if (error) throw error;

      setMessage("Contestant uploaded successfully.");
      setName("");
      setContestantNumber("");
      setVotes(0);
      setState("");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upload Contestant</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Contestant Number</label>
          <input
            className={styles.input}
            type="number"
            value={contestantNumber}
            onChange={(e) => setContestantNumber(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>State</label>
          <input
            className={styles.input}
            type="text"
            value={state}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Image</label>
          <input className={styles.fileInput} type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className={styles.group}>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
