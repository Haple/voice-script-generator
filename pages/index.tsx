import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/ScriptGeneratorV2.module.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getLanguage, loadTranslations, Translations } from "../lib/i18n";

type Actor = {
  id: string;
  name: string;
  emoji: string;
  voiceId: string;
};

type DialogueLine = {
  id: string;
  actorId: string;
  text: string;
  audioUrl?: string;
  originalText?: string;
  isModified?: boolean;
  isProcessing?: boolean;
};

const DEFAULT_ACTORS: Actor[] = [
  {
    id: "actor1",
    name: "Actor 1",
    emoji: "👨🏻",
    voiceId: "qNkzaJoHLLdpvgh5tISm",
  },
  {
    id: "actor2",
    name: "Actress 2",
    emoji: "👩🏻",
    voiceId: "eVItLK1UvXctxuaRV2Oq",
  },
];

const AVAILABLE_VOICES = [
  { id: "qNkzaJoHLLdpvgh5tISm", name: "Male Voice", gender: "male" },
  { id: "eVItLK1UvXctxuaRV2Oq", name: "Female Voice", gender: "female" },

  // Want to add more voices? Add them here!
  
  // { id: "ELEVEN_LABS_ID_HERE", name: "Deep Male Voice", gender: "male" },
  // { id: "ELEVEN_LABS_ID_HERE", name: "Young Female Voice", gender: "female" },
  
];

export default function ScriptGeneratorV2() {
  const router = useRouter();
  const language = getLanguage(router);
  const t: Translations = loadTranslations(language);

  const [actors, setActors] = useState<Actor[]>(DEFAULT_ACTORS);
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [showActorEditor, setShowActorEditor] = useState<boolean>(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isDragging = useRef(false);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentAudio && audioRef.current) {
      audioRef.current.src = currentAudio;
      audioRef.current.play();

      // Clear any existing event listeners to prevent duplicates
      audioRef.current.removeEventListener("ended", handleAudioEnded);

      // Add event listener for audio ended to handle sequential playback
      audioRef.current.addEventListener("ended", handleAudioEnded);
    }

    return () => {
      // Clean up the event listener when component unmounts or currentAudio changes
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, [currentAudio]);

  const addNewLine = (afterIndex?: number) => {
    if (actors.length === 0) return;

    const newLineId = `line_${Date.now()}`;
    const newLine: DialogueLine = {
      id: newLineId,
      actorId: actors[0].id,
      text: "",
    };

    let newLineIndex = dialogueLines.length;

    if (
      afterIndex !== undefined &&
      afterIndex >= 0 &&
      afterIndex < dialogueLines.length
    ) {
      // Insert at specific position
      const newLines = [...dialogueLines];
      newLines.splice(afterIndex + 1, 0, newLine);
      newLineIndex = afterIndex + 1;
      setDialogueLines(newLines);
    } else {
      // Add to the end
      setDialogueLines([...dialogueLines, newLine]);
    }

    // Use setTimeout to ensure the DOM has updated before trying to scroll
    setTimeout(() => {
      // Find the newly added line element
      const newLineElement = document.getElementById(newLineId);
      if (newLineElement) {
        // Scroll to the element
        newLineElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Focus on the textarea within the new line
        const textarea = newLineElement.querySelector("textarea");
        if (textarea) {
          textarea.focus();
        }

        // Find the parent line container
        const lineContainer = newLineElement.closest(
          `.${styles.lineContainer}`,
        );
        if (lineContainer) {
          // Add a temporary class to show the buttons
          lineContainer.classList.add("show-buttons");

          // Add the same class to the previous and next line containers (if they exist)
          const prevContainer = lineContainer.previousElementSibling;
          const nextContainer = lineContainer.nextElementSibling;

          if (
            prevContainer &&
            prevContainer.classList.contains(styles.lineContainer)
          ) {
            prevContainer.classList.add("show-buttons");
          }

          if (
            nextContainer &&
            nextContainer.classList.contains(styles.lineContainer)
          ) {
            nextContainer.classList.add("show-buttons");
          }

          // Remove the class after a few seconds
          setTimeout(() => {
            lineContainer.classList.remove("show-buttons");
            if (prevContainer) prevContainer.classList.remove("show-buttons");
            if (nextContainer) nextContainer.classList.remove("show-buttons");
          }, 9000);
        }
      } else {
        // Fallback if element isn't found
        scriptContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };

  const removeLine = (lineId: string) => {
    setDialogueLines(dialogueLines.filter((line) => line.id !== lineId));
  };

  const updateLine = (
    lineId: string,
    field: keyof DialogueLine,
    value: string,
  ) => {
    setDialogueLines(
      dialogueLines.map((line) => {
        if (line.id === lineId) {
          // Check if it's a text field and if we need to track modification
          if (field === "text") {
            // If this is the first change, save the original text
            const originalText =
              line.originalText !== undefined ? line.originalText : line.text;

            // Check if text is modified from the original (for audio regeneration)
            const isModified = value !== originalText;

            return {
              ...line,
              [field]: value,
              originalText,
              isModified,
            };
          }
          return { ...line, [field]: value };
        }
        return line;
      }),
    );
  };

  const addNewActor = () => {
    const newId = `actor_${Date.now()}`;
    const newActor: Actor = {
      id: newId,
      name: `Actor ${actors.length + 1}`,
      emoji: "🧑",
      voiceId: AVAILABLE_VOICES[0].id,
    };

    setActors([...actors, newActor]);
    setEditingActor(newActor);
    setShowActorEditor(true);
  };

  const updateActor = (actorId: string, field: keyof Actor, value: string) => {
    const updatedActors = actors.map((actor) =>
      actor.id === actorId ? { ...actor, [field]: value } : actor,
    );

    setActors(updatedActors);

    if (editingActor && editingActor.id === actorId) {
      setEditingActor({ ...editingActor, [field]: value });
    }
  };

  const removeActor = (actorId: string) => {
    setActors(actors.filter((actor) => actor.id !== actorId));

    if (actors.length > 1) {
      const fallbackActorId = actors.find((a) => a.id !== actorId)?.id || "";
      setDialogueLines(
        dialogueLines.map((line) =>
          line.actorId === actorId
            ? { ...line, actorId: fallbackActorId }
            : line,
        ),
      );
    } else {
      setDialogueLines([]);
    }
  };

  const openActorEditor = (actor: Actor) => {
    setEditingActor(actor);
    setShowActorEditor(true);
  };

  const closeActorEditor = () => {
    setEditingActor(null);
    setShowActorEditor(false);
  };

  const previewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    try {
      const response = await fetch("/api/script-generator-v2/preview-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceId: voiceId,
          text: "Hello, this is a preview of my voice.",
        }),
      });

      if (!response.ok) throw new Error("Failed to preview voice");

      const data = await response.json();
      if (data.audioUrl) {
        setCurrentAudio(data.audioUrl);
      }
    } catch (error) {
      console.error("Error previewing voice:", error);
      setErrorMessage("Failed to preview voice. Please try again.");
    } finally {
      setPreviewingVoice(null);
    }
  };

  const saveActor = () => {
    if (!editingActor) return;

    if (editingActor.id) {
      setActors(
        actors.map((actor) =>
          actor.id === editingActor.id ? editingActor : actor,
        ),
      );
    } else {
      const newActor = {
        ...editingActor,
        id: `actor_${Date.now()}`,
      };
      setActors([...actors, newActor]);
    }

    setEditingActor(null);
    setShowActorEditor(false);
  };

  const generateVoices = async (specificLineId?: string) => {
    if ((dialogueLines.length === 0 || isGenerating) && !specificLineId) return;

    setIsGenerating(true);
    setCurrentAudio(null);
    setCurrentLineIndex(-1);

    try {
      // If a specific line was requested, only process that one
      let linesToProcess;

      if (specificLineId) {
        linesToProcess = dialogueLines
          .filter(
            (line) => line.id === specificLineId && line.text.trim() !== "",
          )
          .map((line) => ({ ...line, isProcessing: true }));

        // Mark this line as processing
        setDialogueLines((prevLines) =>
          prevLines.map((l) =>
            l.id === specificLineId ? { ...l, isProcessing: true } : l,
          ),
        );
      } else {
        // Otherwise, process new or modified lines with non-empty text
        linesToProcess = dialogueLines
          .filter(
            (line) =>
              (line.isModified || !line.audioUrl) && line.text.trim() !== "",
          )
          .map((line) => ({ ...line, isProcessing: true }));

        // Mark these lines as processing
        const processingIds = linesToProcess.map((l) => l.id);
        setDialogueLines((prevLines) =>
          prevLines.map((l) =>
            processingIds.includes(l.id) ? { ...l, isProcessing: true } : l,
          ),
        );
      }

      // If no lines need processing, exit early
      if (linesToProcess.length === 0) {
        setIsGenerating(false);
        return;
      }

      const response = await fetch("/api/script-generator-v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lines: linesToProcess,
          actors: actors,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate voices");
      }

      const data = await response.json();

      setDialogueLines((prevLines) => {
        const newLines = [...prevLines];
        data.lines.forEach((updatedLine) => {
          const lineIndex = newLines.findIndex(
            (line) => line.id === updatedLine.id,
          );
          if (lineIndex !== -1 && updatedLine.audioUrl) {
            newLines[lineIndex] = {
              ...newLines[lineIndex],
              audioUrl: updatedLine.audioUrl,
              isModified: false,
              isProcessing: false,
              originalText: newLines[lineIndex].text, // Update the original text to match
            };
          }
        });
        return newLines;
      });
    } catch (error) {
      console.error("Error generating voices:", error);
      setErrorMessage("Error generating voices. Please try again.");

      // Clear processing state for all lines
      setDialogueLines((prevLines) =>
        prevLines.map((l) => ({ ...l, isProcessing: false })),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const playLine = (index: number) => {
    if (index < 0 || index >= dialogueLines.length) return;

    const line = dialogueLines[index];
    if (line.audioUrl) {
      setCurrentAudio(line.audioUrl);
      setCurrentLineIndex(index);

      // Scroll the line into view
      setTimeout(() => {
        const lineElement = document.getElementById(line.id);
        if (lineElement) {
          lineElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  };

  const playAllLines = async () => {
    if (dialogueLines.length === 0) return;

    const linesToPlay = dialogueLines.filter((line) => line.audioUrl);
    if (linesToPlay.length === 0) return;

    // Start with the first line with audio
    const firstLineIndex = dialogueLines.findIndex((line) => line.audioUrl);
    if (firstLineIndex === -1) return;

    setCurrentLineIndex(firstLineIndex);
    setCurrentAudio(dialogueLines[firstLineIndex].audioUrl);

    // Scroll the first line into view
    setTimeout(() => {
      const lineElement = document.getElementById(
        dialogueLines[firstLineIndex].id,
      );
      if (lineElement) {
        lineElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // Handle audio ended event for sequential playback
  const handleAudioEnded = () => {
    // Find the next line with audio after the current one
    const currentIdx = currentLineIndex;
    let nextIndex = -1;

    for (let i = currentIdx + 1; i < dialogueLines.length; i++) {
      if (dialogueLines[i].audioUrl) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex !== -1) {
      setCurrentLineIndex(nextIndex);
      setCurrentAudio(dialogueLines[nextIndex].audioUrl);
      // Audio will play automatically since we're updating the currentAudio state

      // Scroll the next line into view
      setTimeout(() => {
        const lineElement = document.getElementById(
          dialogueLines[nextIndex].id,
        );
        if (lineElement) {
          lineElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } else {
      // Reset when no more lines to play
      setCurrentLineIndex(-1);
      setCurrentAudio(null);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(dialogueLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDialogueLines(items);
  };

  const onDragStart = () => {
    isDragging.current = true;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{t.title}</title>
        <meta
          name="description"
          content="Create voice-acted scripts with multiple actors"
        />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.titleHighlight}>{t.title}</span>
          <span className={styles.subtitle}>{t.subtitle}</span>
        </h1>

        <div className={styles.toolbox}>
          <div className={styles.actorsSection}>
            <h2>{t.actors.title}</h2>
            <div className={styles.actorsList}>
              {actors.map((actor) => (
                <div
                  key={actor.id}
                  className={styles.actorCard}
                  onClick={() => openActorEditor(actor)}
                >
                  <div className={styles.actorEmoji}>{actor.emoji}</div>
                  <div className={styles.actorName}>{actor.name}</div>
                </div>
              ))}
              <div className={styles.addActorButton} onClick={addNewActor}>
                <span>+</span>
              </div>
            </div>
          </div>

          <div className={styles.scriptControls}></div>

          {dialogueLines.some((line) => line.audioUrl) && (
            <button
              className={styles.floatingPlayButton}
              onClick={playAllLines}
              title="Play all audio"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.scriptContainer} ref={scriptContainerRef}>
          {dialogueLines.length === 0 ? (
            <div className={styles.emptyScript}>
              <p>{t.emptyScript}</p>
              <button
                className={styles.controlButton}
                onClick={addNewLine}
                disabled={actors.length === 0}
              >
                {t.startWriting}
              </button>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className={styles.errorMessage}>
                  <p>{errorMessage}</p>
                  <button onClick={() => setErrorMessage(null)}>Dismiss</button>
                </div>
              )}

              <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                <Droppable droppableId="scriptLines">
                  {(provided) => (
                    <div
                      className={styles.scriptLines}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {dialogueLines.map((line, index) => (
                        <div key={line.id} className={styles.lineContainer}>

                          <Draggable draggableId={line.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                id={line.id}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${styles.scriptLine} ${index === currentLineIndex ? styles.activeLine : ""} ${snapshot.isDragging ? styles.dragging : ""} ${line.isModified ? styles.modifiedLine : ""} ${line.isProcessing ? styles.processingLine : ""}`}
                              >
                                <div className={styles.lineHeader}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className={styles.dragHandle}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        boxShadow: "none",
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                                      </svg>
                                    </div>
                                    <div className={styles.lineMenu}>
                                      <div
                                        className={styles.menuButton}
                                        style={{
                                          background: "transparent",
                                          border: "none",
                                          boxShadow: "none",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.currentTarget.classList.toggle(
                                            "active",
                                          );
                                        }}
                                      >
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                        >
                                          <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                        </svg>
                                        <div className={styles.menuDropdown}>
                                          {!line.isModified &&
                                            line.audioUrl && (
                                              <button
                                                className={styles.menuItem}
                                                onClick={() => playLine(index)}
                                                disabled={
                                                  isGenerating ||
                                                  isDragging.current ||
                                                  line.isProcessing
                                                }
                                              >
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="currentColor"
                                                >
                                                  <path d="M8 5v14l11-7z" />
                                                </svg>
                                                <span>{t.dialog.play}</span>
                                              </button>
                                            )}

                                          {line.isModified &&
                                            !line.isProcessing && (
                                              <button
                                                className={styles.menuItem}
                                                onClick={() =>
                                                  generateVoices(line.id)
                                                }
                                                disabled={isGenerating}
                                                onMouseEnter={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="currentColor"
                                                >
                                                  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                                </svg>
                                                <span>{t.dialog.generate}</span>
                                              </button>
                                            )}

                                          {!line.isModified &&
                                            line.audioUrl && (
                                              <button
                                                className={styles.menuItem}
                                                onClick={() =>
                                                  generateVoices(line.id)
                                                }
                                                disabled={
                                                  isGenerating ||
                                                  line.isProcessing
                                                }
                                                onMouseEnter={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 24 24"
                                                  fill="currentColor"
                                                >
                                                  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                                </svg>
                                                <span>
                                                  {t.dialog.regenerate}
                                                </span>
                                              </button>
                                            )}

                                          <button
                                            className={
                                              styles.menuItem +
                                              " " +
                                              styles.deleteMenuItem
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeLine(line.id);
                                            }}
                                            disabled={
                                              isGenerating || line.isProcessing
                                            }
                                          >
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="currentColor"
                                            >
                                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                            <span>{t.dialog.delete}</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <select
                                    className={styles.actorSelect}
                                    value={line.actorId}
                                    onChange={(e) =>
                                      updateLine(
                                        line.id,
                                        "actorId",
                                        e.target.value,
                                      )
                                    }
                                    disabled={isGenerating || line.isProcessing}
                                  >
                                    {actors.map((actor) => (
                                      <option key={actor.id} value={actor.id}>
                                        {actor.emoji} {actor.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div style={{ position: "relative" }}>
                                  <textarea
                                    className={styles.lineTextarea}
                                    value={line.text}
                                    onChange={(e) =>
                                      updateLine(
                                        line.id,
                                        "text",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t.dialog.enterDialogue}
                                    rows={2}
                                    disabled={isGenerating || line.isProcessing}
                                  />
                                  {line.text && (
                                    <div
                                      className={`${styles.characterCount} ${line.text.length > 280 ? styles.limit : ""}`}
                                    >
                                      {line.text.length} / 280
                                    </div>
                                  )}

                                  {line.isProcessing && (
                                    <div className={styles.processingOverlay}>
                                      <div
                                        className={styles.processingSpinner}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>

                          <div className={styles.addLineButtonContainer}>
                            <button
                              className={styles.addLineButton}
                              onClick={() => addNewLine(index)}
                              title="Add new line"
                            >
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {dialogueLines.length > 2 && (
                <div className={styles.endScriptControls}>
                  <button
                    className={styles.controlButton}
                    onClick={() => generateVoices()}
                    disabled={
                      isGenerating ||
                      !dialogueLines.some(
                        (line) => line.isModified || !line.audioUrl,
                      )
                    }
                  >
                    {isGenerating ? "Generating..." : t.generateVoices}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {showActorEditor && editingActor && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowActorEditor(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingActor?.id ? t.actors.editActor : t.actors.addActor}
              </h2>

              <div className={styles.formGroup}>
                <label>{t.actors.name}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingActor?.name || ""}
                  onChange={(e) =>
                    setEditingActor({ ...editingActor!, name: e.target.value })
                  }
                  placeholder="Actor name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t.actors.emoji}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editingActor?.emoji || ""}
                  onChange={(e) =>
                    setEditingActor({ ...editingActor!, emoji: e.target.value })
                  }
                  maxLength={2}
                  placeholder="👨"
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t.actors.voice}</label>
                <div className={styles.voiceSelection}>
                  <select
                    className={styles.input}
                    value={editingActor?.voiceId || ""}
                    onChange={(e) =>
                      setEditingActor({
                        ...editingActor!,
                        voiceId: e.target.value,
                      })
                    }
                  >
                    {AVAILABLE_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className={`${styles.previewButton} ${previewingVoice === editingActor?.voiceId ? styles.previewLoading : ""}`}
                    onClick={() => previewVoice(editingActor?.voiceId || "")}
                    disabled={
                      !editingActor?.voiceId || previewingVoice !== null
                    }
                  >
                    {previewingVoice === editingActor?.voiceId
                      ? "Loading..."
                      : t.actors.preview}
                  </button>
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button
                  className={styles.saveButton}
                  onClick={saveActor}
                  disabled={
                    !editingActor?.name ||
                    !editingActor?.emoji ||
                    !editingActor?.voiceId
                  }
                >
                  {t.actors.save}
                </button>

                {editingActor?.id && (
                  <button
                    className={styles.deleteActorButton}
                    onClick={() => {
                      removeActor(editingActor.id);
                      setShowActorEditor(false);
                    }}
                  >
                    {t.actors.delete}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <audio ref={audioRef} className={styles.hiddenAudio}>
          <source src="" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </main>
    </div>
  );
}
