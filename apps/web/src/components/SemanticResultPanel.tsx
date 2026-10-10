"use client";

type SemanticField = {
  key: string;
  label: string;
  presentation: string;
  displayText?: string;
  url?: string;
  assetRefs?: Array<{ id: string; filename: string }>;
  previewMode: "inline" | "download_only";
};

export function SemanticResultPanel(props: {
  fields: SemanticField[];
  jobId: string;
  downloadAllowed: boolean;
  onDownloadAsset: (assetId: string) => void;
}) {
  return (
    <div className="form-stack">
      {props.fields.map((field) => (
        <div key={field.key} className="detail-panel">
          <strong>{field.label}</strong>
          {field.presentation === "url" && field.url && (
            <p className="meta">
              <a href={field.url} rel="noopener noreferrer" target="_blank">
                {field.url}
              </a>
            </p>
          )}
          {field.displayText && field.previewMode === "inline" && (
            <pre className="pre-block font-mono">{field.displayText}</pre>
          )}
          {field.assetRefs?.map((asset) => (
            <p key={asset.id} style={{ marginTop: "0.5rem" }}>
              {props.downloadAllowed ? (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => props.onDownloadAsset(asset.id)}
                >
                  Download {asset.filename}
                </button>
              ) : (
                <span className="meta">{asset.filename} (expired)</span>
              )}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
