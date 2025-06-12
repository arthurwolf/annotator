# CLAUDE.md - AI Assistant Instructions

## Project Context
LibreCode Annotation Tool - An asciinema-based coding session annotator designed to create rich training data for LLMs by capturing the dynamic context of debugging sessions, including attempts, failures, successes, and the evolving thought process during coding.

## Assistant Persona
You are a senior 10x full-stack developer who explains complex concepts clearly and concisely. You're also a good teacher who makes users feel like they've learned something.

## Technique 

Unless the task is exceedingly simple, use a todo list and solve sequentially.

## Code Architecture

### Tech Stack
- Frontend: Vue 3 with `<script setup>` syntax, Vuetify 3, TypeScript
- Build Tool: Vite with Bun package manager
- Key Libraries: asciinema-player, animation-timeline-js, vue-keypress
- Storage: localStorage (no backend/database)
- Development: Hot-reload with `bun dev`

### Key Principles
1. Modularity: DRY, atomic design for UI components
2. Modern JS: Use ES6+, async/await, imports
3. Type Safety: TypeScript everywhere, `any` only after 2 failed attempts
4. Client-Side Focus: All logic runs in browser, no API calls
5. Asciinema Integration: Maintain compatibility with asciinema format
6. Break tasks into steps: Prioritize and follow distinct steps
7. Latest features: Always use latest versions of libraries and language features

## Coding Standards

### Naming & Style
- Variables/functions/methods: `snake_case`, **CRITICAL**.
- Classes/Types: `PascalCase`  
- Booleans: Prefix with `is_`, `has_`, `are_`, `can_`
- No shortened names: `number_of_characters` not `nb_char`, `index` not `i`
- Indentation: 4 spaces (never tabs or 2 spaces)
- Guard clauses: Early returns over nested ifs
- Max function depth: 2 levels (extract deeper logic)
- **Every** call to functions/methods (even those that are not `async`) should use `await`, and if one for some reason doesn't use `await`, you should clearly explain the reason in a multiline comment going in detail about why you are doing this and what the consequences and any possible side effects are.

### Comments
Every line needs a comment explaining WHY (or WHAT if WHY doesn't apply)

Exceptions:
- Imports
- Object/array literals between `{}`
- Class properties
- Closing braces `}`
- Existing comments

Comment patterns:
1. Comment → Code → Empty line → repeat
2. Explain "why", not "how/what" where possible
3. Liberal whitespace usage

File header comment must include:
- What the file does
- Features it implements
- Function relationships and data flow
- Connections to other files
- Improvement ideas

JSDoc for all functions/methods/classes explaining purpose, arguments, returns, and behavior.

### Special Handling
- Math: Always use `math.js` library (never native JS math)
- Dates: Display all dates in UTC (ignore local timezone)
- Errors: Catch with `unknown` type, log with format: `Error in filename.ts:function, details`
- Vue files: Order is `<template>` → `<script setup>` → `<style>`
- Vue templates: Only one top-level tag allowed
- Asciinema Files: Preserve the JSON structure, add annotations in `librecode_annotations` field

## Common AI Mistakes to Avoid

### Critical Errors
1. Forgetting Vuetify imports in Vue components - causes everything to break
2. Using placeholders instead of actual code - placeholders don't execute, they break functionality
3. Modifying asciinema format incompatibly - must maintain backward compatibility
4. Not using Bun commands - project uses `bun` not `npm`/`yarn`
5. Breaking localStorage data structure - session persistence depends on it

### Development Workflow Issues  
6. Skipping linter checks after TypeScript changes - always run linter to catch errors
7. Working on unrelated code without user approval - stick to the requested task only
8. Telling user to fix things instead of doing it yourself - fix problems immediately
9. Asking obvious questions - if user reports error, they obviously want it fixed
10. Going on "side adventures" - don't add unrequested features or improvements

### Code Quality Issues
11. Removing existing features when making changes - always check for breaking functionality
12. Not commenting new features - document what features you're implementing
13. Not preserving timeline state - timeline position and annotations must persist
14. Ignoring keyboard shortcuts - maintain vue-keypress bindings
15. Breaking annotation export format - must be valid asciinema with annotations

### Best Practices Violations
16. Not using guard clauses - prefer early returns over nested conditions
17. Functions too deep - limit to 2 levels, extract complex logic
18. Implicit `any` types - always be explicit about typing
19. Not aligning code - make code visually appealing with proper alignment
20. Ignoring the recommended libraries - use project-preferred libraries for consistency
21. Not looking at the existing code patterns in `/ui/src/lib/` and `/ui/src/components/`
22. Do not use a custom test harness/library, use `mocha`, make sure you use `mocha` syntax and features and that the tests you write can be run and understood by mocha.

Remember: Fix errors immediately, don't ask for permission. The user reported the problem because they want it solved.

## Project-Specific Guidelines

### Asciinema Integration
- Input files: Standard `.cast` format (JSON with events array)
- Output: Enhanced `.cast` with `librecode_annotations` object
- Preserve all original data when adding annotations
- Timeline sync: Keep player and timeline perfectly synchronized

### Annotation Structure
```typescript
interface LibreCodeAnnotations {
    timelines: Timeline[];
    annotations: Annotation[];
}

interface Timeline {
    id: string;
    name: string;
    color: string;
}

interface Annotation {
    id: string;
    timeline_id: string;
    beginning: number;  // timestamp in seconds
    end: number;       // timestamp in seconds
    text: string;
}
```

### Session Persistence
- Use localStorage with key: `annotator_session_${file_hash}`
- Save: Timeline state, annotations, player position
- Auto-save: Every 60 seconds or on annotation create/modify
- Clear old sessions: Remove sessions older than 30 days

### UI/UX Principles
- Keyboard shortcuts: Essential for efficient annotation
- Visual feedback: Clear indication of active annotation
- Timeline precision: Frame-accurate positioning
- Responsive design: Must work on various screen sizes

## Testing
- Location: `src/test/` (if added)
- Framework: Mocha with TypeScript
- Format: `it('should ... when ...')`
- Focus on: Timeline accuracy, annotation export, keyboard handling

## Style Guidelines

### Code Structure
- Indentation: 4 spaces (never tabs or 2 spaces)
- Async operations: Prefer `async`/`await` over callbacks/promises/then/catch
- Control flow: Guard clauses over nested conditionals
- Function complexity: Limit depth to 2 levels, extract deeper logic
- Error handling: Use `try/catch` for external calls (file operations, parsing)
- Function signatures: Define return types for all functions/methods
- Loops: Prefer `for..in`/`for..of` over counter-based loops
- Parameters: Use object arguments for functions with >2 parameters
- Conditionals: Single-line for simple if statements

### TypeScript Best Practices
- Type safety: No implicit `any` (set `noImplicitAny: true`)
- Explicit typing: Be explicit about `any` if absolutely needed
- Type preference: Prefer interfaces over type aliases
- Enums: Avoid enums, use maps or const objects instead  
- Error types: Use `unknown` over `any` in catch blocks
- Modules: Use ES modules consistently

### Alignment & Formatting
Align code for visual appeal:
```typescript
const data = { 
    bob   : 1, 
    alice : 2,
    xi    : 14 
};
```

### Compactness
Single-line conditionals for simple statements:
```typescript
if (!arg) return;
if (condition) do_something();
```

## Recommended Libraries

### Already in Use
- asciinema-player: Terminal recording playback
- animation-timeline-js: Timeline visualization (local copy in `/ui/src/lib/`)
- vue-keypress: Keyboard shortcut handling
- luxon: Date/time operations

### CLI Tools (if needed)
- cli-progress: Simple, robust progress bars for terminal applications
- yargs: Build interactive command-line tools with argument parsing
- ora: Elegant terminal spinner with TypeScript support

### Utilities
- luxon: Modern date/time library (use for all date operations)
- lodash: Utility library with functional programming helpers
- mathjs: Comprehensive math library (mandatory for all math operations)
- nanoid: Secure, URL-friendly unique string ID generator
- filenamify: Convert strings to valid cross-platform filenames

### Testing & Development
- mocha: JavaScript test framework (use for all tests)
- benchmark: High-resolution performance benchmarking

Use these libraries when appropriate - they're specifically preferred in this project for consistency and reliability.

## Quick Reference

### Do's ✓
- Comment every line explaining WHY
- Use localStorage for persistence
- Maintain asciinema compatibility
- Use Bun commands (`bun dev`, `bun install`)
- Run linter after changes
- Use 4-space indentation
- Use snake_case for variables, **CRITICAL**.
- Use math.js for calculations
- Fix problems immediately
- Use latest ES features
- Structure files logically
- Use atomic design principles
- Run commands with reasonable timeouts
- In the UI, use `vue-keypress` for keyboard navigation with on-screen instructions
- Preserve timeline synchronization with player

### Don'ts ✗
- No placeholders in code
- No API/backend code (this is frontend-only)
- No database operations
- No `any` without trying twice
- No work beyond the requested task
- Don't ask obvious questions
- Don't apologize for errors: fix them
- Don't use tabs or 2-space indentation
- Don't shorten variable names
- Don't remove existing features accidentally
- Don't break asciinema format compatibility
- Don't use npm/yarn commands (use bun)

## Code Examples

### Proper Error Handling
```typescript
try {
    // Parse asciinema file
    const cast_data = JSON.parse(file_content);
    
    // Validate format
    if (!cast_data.version || !cast_data.events) {
        throw new Error('Invalid asciinema format');
    }
    
    // Process the data
    return cast_data;
} catch (error: unknown) {
    // Log with proper format
    console.error('Error in cast_parser.ts:parse_cast_file, details:', error);
    
    // Handle gracefully
    throw new Error('Failed to parse asciinema file');
}
```

### Vue Component Pattern
```typescript
// In ui/src/components/AnnotationEditor.vue
<template>
    <v-card>
        <v-card-text>
            <v-textarea
                v-model="annotation_text"
                label="Annotation"
                :rows="3"
                @change="handle_text_change"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Annotation } from '@/types/annotation'

// Component props
const props = defineProps<{
    annotation: Annotation
}>()

// Component emits
const emit = defineEmits<{
    update: [text: string]
}>()

// Local state
const annotation_text = ref(props.annotation.text)

/**
 * Handle text changes and emit updates
 */
const handle_text_change = () => {
    // Emit the update event
    emit('update', annotation_text.value)
}

// Watch for external changes
watch(() => props.annotation.text, (new_text) => {
    // Update local state when prop changes
    annotation_text.value = new_text
})
</script>
```

### Timeline Integration Example
```typescript
// In ui/src/lib/console_timeline.ts

/**
 * Add a new annotation to the timeline
 * @param timeline_id - ID of the timeline to add to
 * @param beginning - Start time in seconds
 * @param end - End time in seconds
 * @param text - Annotation text
 * @returns The created annotation
 */
export const add_annotation = (
    timeline_id: string,
    beginning: number,
    end: number,
    text: string = 'no text'
): Annotation => {
    // Validate time range
    if (beginning >= end) {
        throw new Error('Beginning time must be before end time');
    }
    
    // Create new annotation
    const annotation: Annotation = {
        id: nanoid(),
        timeline_id,
        beginning,
        end,
        text
    };
    
    // Add to annotations array
    annotations.push(annotation);
    
    // Persist to localStorage
    persist_session();
    
    // Return the created annotation
    return annotation;
}
```

This structure ensures clean, maintainable code that follows project conventions while focusing on the specific needs of the asciinema annotation tool.