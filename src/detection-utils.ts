/**
 * Generic detection utilities for highlighting and summarizing firewall detections
 * No case-specific logic - works with any entity types
 */

import type { Detections, Span, SubjectMention, PredicateMention } from './engine/types';

export interface HighlightSegment {
  text: string;
  isDetected: boolean;
  entityType?: string;
  entityId?: string;
  confidence?: number;
  category?: 'subject' | 'predicate';
}

export interface DetectionSummary {
  totalCount: number;
  subjectCount: number;
  predicateCount: number;
  subjectTypes: string[];
  predicateTypes: string[];
  subjectsByType: Map<string, number>;
  predicatesByType: Map<string, number>;
}

type EntityWithSpan = {
  span: Span;
  type: string;
  id: string;
  confidence: number;
  category: 'subject' | 'predicate';
};

/**
 * Highlight detected entities in text by building segments
 * Returns an array of text segments, some marked as detected
 */
export function highlightDetections(
  text: string,
  detections: Detections
): HighlightSegment[] {
  const entities: EntityWithSpan[] = [];

  // Collect all subject mentions with their spans
  for (const subject of detections.subjects) {
    for (const span of subject.spans) {
      entities.push({
        span,
        type: subject.type,
        id: subject.id,
        confidence: subject.confidence,
        category: 'subject',
      });
    }
  }

  // Collect all predicate mentions with their spans
  for (const predicate of detections.predicates) {
    for (const span of predicate.spans) {
      entities.push({
        span,
        type: predicate.type,
        id: predicate.id,
        confidence: predicate.confidence,
        category: 'predicate',
      });
    }
  }

  // Sort by start position to process in order
  entities.sort((a, b) => a.span.start - b.span.start);

  // Build segments
  const segments: HighlightSegment[] = [];
  let currentPos = 0;

  for (const entity of entities) {
    // Add non-detected text before this entity
    if (currentPos < entity.span.start) {
      segments.push({
        text: text.slice(currentPos, entity.span.start),
        isDetected: false,
      });
    }

    // Add detected entity segment
    segments.push({
      text: text.slice(entity.span.start, entity.span.end),
      isDetected: true,
      entityType: entity.type,
      entityId: entity.id,
      confidence: entity.confidence,
      category: entity.category,
    });

    currentPos = entity.span.end;
  }

  // Add remaining non-detected text
  if (currentPos < text.length) {
    segments.push({
      text: text.slice(currentPos),
      isDetected: false,
    });
  }

  return segments;
}

/**
 * Get summary statistics about detections
 */
export function summarizeDetections(detections: Detections): DetectionSummary {
  const subjectCount = detections.subjects.length;
  const predicateCount = detections.predicates.length;
  const totalCount = subjectCount + predicateCount;

  const subjectTypes = new Set(detections.subjects.map((s) => s.type));
  const predicateTypes = new Set(detections.predicates.map((p) => p.type));

  // Count by type
  const subjectsByType = new Map<string, number>();
  for (const subject of detections.subjects) {
    subjectsByType.set(subject.type, (subjectsByType.get(subject.type) || 0) + 1);
  }

  const predicatesByType = new Map<string, number>();
  for (const predicate of detections.predicates) {
    predicatesByType.set(
      predicate.type,
      (predicatesByType.get(predicate.type) || 0) + 1
    );
  }

  return {
    totalCount,
    subjectCount,
    predicateCount,
    subjectTypes: Array.from(subjectTypes),
    predicateTypes: Array.from(predicateTypes),
    subjectsByType,
    predicatesByType,
  };
}

/**
 * Group detections by their type
 * Returns a map of entity type to array of mentions
 */
export function groupDetectionsByType(
  detections: Detections
): Map<string, Array<SubjectMention | PredicateMention>> {
  const grouped = new Map<string, Array<SubjectMention | PredicateMention>>();

  for (const subject of detections.subjects) {
    const existing = grouped.get(subject.type) || [];
    existing.push(subject);
    grouped.set(subject.type, existing);
  }

  for (const predicate of detections.predicates) {
    const existing = grouped.get(predicate.type) || [];
    existing.push(predicate);
    grouped.set(predicate.type, existing);
  }

  return grouped;
}

/**
 * Get all unique entity types from detections
 */
export function getUniqueEntityTypes(detections: Detections): string[] {
  const types = new Set<string>();

  for (const subject of detections.subjects) {
    types.add(subject.type);
  }

  for (const predicate of detections.predicates) {
    types.add(predicate.type);
  }

  return Array.from(types);
}

/**
 * Filter detections by confidence threshold
 */
export function filterDetectionsByConfidence(
  detections: Detections,
  minConfidence: number
): Detections {
  return {
    docId: detections.docId,
    sentences: detections.sentences,
    subjects: detections.subjects.filter((s) => s.confidence >= minConfidence),
    predicates: detections.predicates.filter((p) => p.confidence >= minConfidence),
  };
}

/**
 * Filter detections by entity types
 */
export function filterDetectionsByType(
  detections: Detections,
  types: string[]
): Detections {
  const typeSet = new Set(types);

  return {
    docId: detections.docId,
    sentences: detections.sentences,
    subjects: detections.subjects.filter((s) => typeSet.has(s.type)),
    predicates: detections.predicates.filter((p) => typeSet.has(p.type)),
  };
}

