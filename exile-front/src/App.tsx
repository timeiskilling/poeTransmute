import { useEffect, useState } from "react";
import { PassiveTree } from "./passiveThree/PassiveTree";
import type { RawGggNode, RawGggTree } from "./passiveThree/types";

interface CharacterResponse {
  passiveSelection?: Array<number | string>;
  activeAscendancyId?: string;
  ascendancyId?: string;
  ascendancy?: string;

  data?: CharacterResponse;
  charModel?: CharacterResponse;

  [key: string]: unknown;
}

export default function App() {
  const [treeData, setTreeData] = useState<RawGggTree | null>(null);
  const [allocatedHashes, setAllocatedHashes] = useState<
    Array<number | string>
  >([]);

  const [activeAscendancyId, setActiveAscendancyId] = useState<
    string | undefined
  >(undefined);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [treeRes, charRes] = await Promise.all([
          fetch(
            "https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/main/data.json",
            {
              signal: controller.signal,
            },
          ),
          fetch("http://localhost:3000/poe2/character", {
            signal: controller.signal,
          }),
        ]);

        if (!treeRes.ok) {
          throw new Error("Не вдалося завантажити дерево пасивок");
        }

        if (!charRes.ok) {
          throw new Error("Не вдалося завантажити профіль персонажа");
        }

        const treeJson = (await treeRes.json()) as RawGggTree;
        const characterJson = (await charRes.json()) as CharacterResponse;

        const selection = getPassiveSelection(characterJson);

        const explicitAscendancyId = getExplicitAscendancyId(characterJson);

        const inferredAscendancyId =
          explicitAscendancyId ??
          inferAscendancyIdFromAllocatedNodes(treeJson, selection);

        setTreeData(treeJson);
        setAllocatedHashes(selection);
        setActiveAscendancyId(inferredAscendancyId);

        if (!inferredAscendancyId) {
          console.warn(
            "Не вдалося визначити activeAscendancyId. " +
              "Ascendancy panel не буде переміщений у центр.",
          );
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError(err instanceof Error ? err.message : "Невідома помилка");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return <div style={screenStyle}>Завантаження дерева та профілю...</div>;
  }

  if (error) {
    return <div style={screenStyle}>Помилка: {error}</div>;
  }

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "#111217",
      }}
    >
      <PassiveTree
        treeData={treeData}
        allocatedHashes={allocatedHashes}
        activeAscendancyId={activeAscendancyId}
      />
    </main>
  );
}

function getPassiveSelection(
  character: CharacterResponse,
): Array<number | string> {
  const candidates = [
    character.passiveSelection,
    character.data?.passiveSelection,
    character.charModel?.passiveSelection,
    character.data?.charModel?.passiveSelection,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getExplicitAscendancyId(
  character: CharacterResponse,
): string | undefined {
  const candidates: unknown[] = [
    character.activeAscendancyId,
    character.ascendancyId,
    character.ascendancy,

    character.data?.activeAscendancyId,
    character.data?.ascendancyId,
    character.data?.ascendancy,

    character.charModel?.activeAscendancyId,
    character.charModel?.ascendancyId,
    character.charModel?.ascendancy,

    character.data?.charModel?.activeAscendancyId,
    character.data?.charModel?.ascendancyId,
    character.data?.charModel?.ascendancy,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return undefined;
}

function inferAscendancyIdFromAllocatedNodes(
  treeData: RawGggTree,
  allocatedHashes: Array<number | string>,
): string | undefined {
  if (!treeData.nodes || allocatedHashes.length === 0) {
    return undefined;
  }

  const allocatedSet = new Set<string>();

  for (let index = 0; index < allocatedHashes.length; index += 1) {
    allocatedSet.add(String(allocatedHashes[index]));
  }

  const ascendancyUsage = new Map<string, number>();

  for (const [rawKey, rawNode] of Object.entries(treeData.nodes)) {
    const skillId = getSkillId(rawKey, rawNode);

    if (!skillId || !allocatedSet.has(skillId)) {
      continue;
    }

    const ascendancyId = getRawAscendancyId(rawNode);

    if (!ascendancyId) {
      continue;
    }

    ascendancyUsage.set(
      ascendancyId,
      (ascendancyUsage.get(ascendancyId) ?? 0) + 1,
    );
  }

  let bestId: string | undefined;
  let bestCount = 0;

  for (const [ascendancyId, count] of ascendancyUsage) {
    if (count > bestCount) {
      bestId = ascendancyId;
      bestCount = count;
    }
  }

  return bestId;
}

function getSkillId(rawKey: string, rawNode: RawGggNode): string | undefined {
  const skill = rawNode.skill ?? Number(rawKey);

  return Number.isFinite(skill) ? String(skill) : undefined;
}

function getRawAscendancyId(rawNode: RawGggNode): string | undefined {
  const record = rawNode as Record<string, unknown>;

  const values = [
    record.ascendancyId,
    record.ascendancyName,
    record.ascendancy,
  ];

  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

const screenStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#111217",
  color: "#f0bd54",
  fontFamily: "sans-serif",
};
