interface Props {
  lyrics: string[];
  selected: number[];
  onSelect: (index: number) => void;
}

export default function LyricsSelector({ lyrics, selected, onSelect }: Props) {
  return (
    <section className="grid gap-2 mt-4">
      {lyrics.map((line, i) => {
        const isSelected = selected.includes(i);
        const disabled = !isSelected && selected.length >= 4;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            disabled={disabled}
            className={`px-3 py-2 rounded-md text-sm text-left transition ${
              isSelected ? "bg-primary text-white" : "bg-muted"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"}`}
          >
            {line}
          </button>
        );
      })}
    </section>
  );
}
