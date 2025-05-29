import React, { useMemo, useState } from "react";
import { Popover } from "@mui/material";

const emojiReactions = (emojiArray = []) => {
  const grouped = emojiArray.reduce((acc, { emoji, sender }) => {
    if (!acc[emoji]) {
      acc[emoji] = { emoji, count: 0, senders: [] };
    }
    acc[emoji].count += 1;
    acc[emoji].senders.push(sender);
    return acc;
  }, {});
  return Object.values(grouped);
};

const EmojiReactions = ({ reactions = [], isOwnMessage = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const groupedReactions = useMemo(
    () => emojiReactions(reactions),
    [reactions]
  );
  const visible = groupedReactions.slice(0, 3);
  const hiddenCount = groupedReactions.length - 3;

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <div
        className={`flex cursor-pointer bg-gray-700 text-white px-2 py-1 rounded-full text-[12px] absolute bottom-[-10px] ${
          isOwnMessage ? "right-0" : "left-0"
        }`}
        onClick={handleClick}
      >
        {visible.map(({ emoji, count }, idx) => (
          <span key={idx} className="flex items-center gap-0.5">
            {emoji}
            {count > 1 && <span className="text-[10px]">{count}</span>}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="text-[10px] ml-1">+{hiddenCount}</span>
        )}
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{
          sx: {
            marginLeft: isOwnMessage ? "-43px" : "43px",
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <div
          className="p-3 rounded-lg bg-neutral text-neutral-content shadow-lg border border-neutral-700 w-64"
          style={{
            backgroundColor: "var(--fallback-b1, oklch(var(--b1) / 1))",
            maxHeight: "180px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4 className="text-sm font-semibold mb-3 sticky top-0 bg-inherit pb-2 border-b border-neutral-700">
            Reactions
          </h4>
          <div className="overflow-y-auto max-h-[250px]">
            {reactions.length > 0 ? (
              reactions.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 hover:bg-neutral-700/30 rounded-lg px-1"
                >
                  <img
                    src={r.sender?.profilePhoto}
                    alt="Sender"
                    className="w-8 h-8 rounded-full border border-gray-600 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {r.sender?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Reacted with {r.emoji}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-2">No reactions yet.</p>
            )}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default EmojiReactions;
