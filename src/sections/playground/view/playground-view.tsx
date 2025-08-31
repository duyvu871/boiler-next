'use client'

import SceneCanvas from 'app/components/3d/SceneCanvas'
import Lights from 'app/components/3d/Lights'
import OrbitControlsRig from 'app/components/3d/OrbitControlsRig'
import GLTFModel from 'app/components/3d/GLTFModel'
import { MODELS_TO_LOAD } from 'app/types/models/clothing'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  categorizeShapeKeyAtom,
  groupedShapeKeysAtom,
  isLoadingAtom,
  loadingTextAtom,
  modelVisibilityAtom,
  resetAllShapeKeysAtom,
  selectedBottomAtom,
  selectedTopAtom,
  setCombinedShapeKeyValueAtom,
  setLoadingTextAtom,
  setModelVisibleAtom,
  setSingleShapeKeyValueAtom,
  zoomValueAtom,
  showPerfAtom,
  shapeKeysAtom
} from 'app/store/playground'
import { useEffect } from 'react'
import {
  AppShell,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Radio,
  ScrollArea,
  Slider,
  Stack,
  Text,
  Title,
  Accordion,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { PlaygroundConfigSchema, type PlaygroundConfig } from 'app/sections/playground/schema'
import { applyImportedConfigAtom } from 'app/store/playground'
import type { ShapeKeyEntry } from 'app/store/playground'

// Mantine-based slider for a single 0..1 shape key group
function SingleSlider({ label, keyName }: { label: string; keyName: string }) {
  const setSingle = useSetAtom(setSingleShapeKeyValueAtom)
  return (
    <Stack gap={6}
      style={{ borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed" tt="capitalize">{label}</Text>
      </Group>
      <Slider step={0.01} min={0} max={1} defaultValue={0} onChange={(v) => setSingle({ key: keyName, value: v })} />
    </Stack>
  )
}

// Mantine-based slider for a combined -1..1 Up/Down group
function CombinedSlider({ label, upKey, downKey }: { label: string; upKey: string; downKey: string }) {
  const setCombined = useSetAtom(setCombinedShapeKeyValueAtom)
  return (
    <Stack gap={6}
      style={{ borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed" tt="capitalize">{label}</Text>
        <Group gap={8}>
          <Text size="xs" c="dimmed">Down</Text>
          <Text size="xs" c="dimmed">Up</Text>
        </Group>
      </Group>
      <Slider step={0.01} min={-1} max={1} defaultValue={0} onChange={(v) => setCombined({ upKey, downKey, value: v })} />
    </Stack>
  )
}

// Clothing selection using Mantine Radio groups in the left navbar
function ClothingSelector() {
  const [top, setTop] = useAtom(selectedTopAtom)
  const [bottom, setBottom] = useAtom(selectedBottomAtom)
  const setModelVisible = useSetAtom(setModelVisibleAtom)

  // Update visibility immediately on user action to avoid any perceived delay
  const onChangeTop = (v: 'none' | 'bodice' | 'shirt') => {
    setTop(v)
    setModelVisible({ name: 'bodice', visible: v === 'bodice' })
    setModelVisible({ name: 'shirt', visible: v === 'shirt' })
  }

  const onChangeTopStr = (value: string) => onChangeTop(value as 'none' | 'bodice' | 'shirt')

  const onChangeBottom = (v: 'none' | 'skirt') => {
    setBottom(v)
    setModelVisible({ name: 'skirt', visible: v === 'skirt' })
  }

  const onChangeBottomStr = (value: string) => onChangeBottom(value as 'none' | 'skirt')

  return (
    <ScrollArea style={{ height: '100%' }}>
      <Stack gap="md" p="md">
        <Paper withBorder p="sm" radius="md">
          <Title order={6}>Tops</Title>
          <Radio.Group value={top} onChange={onChangeTopStr} mt="xs">
            <Stack gap={6}>
              <Radio value="none" label="None" />
              <Radio value="bodice" label="Bodice" />
              <Radio value="shirt" label="Shirt" />
            </Stack>
          </Radio.Group>
        </Paper>
        <Paper withBorder p="sm" radius="md">
          <Title order={6}>Bottoms</Title>
          <Radio.Group value={bottom} onChange={onChangeBottomStr} mt="xs">
            <Stack gap={6}>
              <Radio value="none" label="None" />
              <Radio value="skirt" label="Skirt" />
            </Stack>
          </Radio.Group>
        </Paper>
      </Stack>
    </ScrollArea>
  )
}

// Shape key panels rendered inside the right aside
function ShapeKeyPanels() {
  const groups = useAtomValue(groupedShapeKeysAtom)
  const categorize = useAtomValue(categorizeShapeKeyAtom)

  const general = groups.filter((g) => categorize(g.kind === 'combined' ? g.upKey : g.key) === 'general')
  const advanced = groups.filter((g) => categorize(g.kind === 'combined' ? g.upKey : g.key) === 'advanced')
  const detailed = groups.filter((g) => !general.includes(g) && !advanced.includes(g))

  const renderGroup = (list: typeof groups) => (
    <Stack gap={8} mt="sm">
      {list.length === 0 && <Text size="xs" c="dimmed" fs="italic">No shape keys found.</Text>}
      {list.map((g) =>
        g.kind === 'single' ? (
          <SingleSlider key={`s-${g.key}`} label={g.label} keyName={g.key} />
        ) : (
          <CombinedSlider key={`c-${g.base}`} label={g.label} upKey={g.upKey} downKey={g.downKey} />
        ),
      )}
    </Stack>
  )

  return (
    <Accordion multiple defaultValue={["general", "detailed"]} variant="separated" radius="md">
      <Accordion.Item value="general">
        <Accordion.Control>
          <Title order={6}>General Body</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">{renderGroup(general)}</Stack>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="detailed">
        <Accordion.Control>
          <Title order={6}>Detailed</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">{renderGroup(detailed)}</Stack>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="advanced">
        <Accordion.Control>
          <Title order={6}>Advanced</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">{renderGroup(advanced)}</Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

// Zoom slider using Mantine Slider
function ZoomControl() {
  const [zoom, setZoom] = useAtom(zoomValueAtom)
  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between" mb="xs">
        <Title order={6}>Zoom</Title>
        <Text size="xs" c="dimmed">{zoom.toFixed(1)}x</Text>
      </Group>
      <Slider min={0.5} max={6} step={0.1} value={zoom} onChange={setZoom} />
    </Paper>
  )
}

function PerfToggle() {
  const [showPerf, setShowPerf] = useAtom(showPerfAtom)
  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between">
        <Title order={6}>Performance</Title>
        <Button size="xs" variant={showPerf ? 'filled' : 'light'} onClick={() => setShowPerf(!showPerf)}>
          {showPerf ? 'Hide Stats' : 'Show Stats'}
        </Button>
      </Group>
      <Text size="xs" c="dimmed" mt={6}>Adaptive DPR + Preload are enabled.</Text>
    </Paper>
  )
}

function ExportImportControls() {
  const setApply = useSetAtom(applyImportedConfigAtom)

  const onExport = () => {
    // Build export data from current store
    const modelVisMap = useAtomValue(modelVisibilityAtom)
    const skMap = useAtomValue(shapeKeysAtom)

    const exportData: PlaygroundConfig = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      modelInfo: Object.entries(modelVisMap).map(([name, visible]) => ({ name, visible })),
      shapeKeys: Object.fromEntries(Object.entries(skMap).map(([k, v]) => [k, (v as any)[0]?.mesh.morphTargetInfluences?.[(v as any)[0].index] ?? 0])),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `avatar-shapekeys-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    showNotification({ title: 'Exported', message: 'Config exported successfully', color: 'green' })
  }

  const onImport = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result))
        const parsed = PlaygroundConfigSchema.safeParse(json)
        if (!parsed.success) {
          // zod returns an object with issues in parsed.error.issues
          const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
          showNotification({ title: 'Import failed', message: details.join('\n'), color: 'red' })
          return
        }
        // Apply config
        setApply({ config: parsed.data })
        showNotification({ title: 'Imported', message: 'Config applied', color: 'green' })
      } catch (err: any) {
        showNotification({ title: 'Import failed', message: String(err.message ?? err), color: 'red' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Group>
      <Button size="xs" onClick={onExport}>Export</Button>
      <input
        id="import-config"
        style={{ display: 'none' }}
        type="file"
        accept="application/json"
        onChange={(e) => onImport(e.target.files ? e.target.files[0] : null)}
      />
      <label htmlFor="import-config">
        <Button size="xs" variant="light" component="span">Import</Button>
      </label>
    </Group>
  )
}

function LoadingOverlay() {
  const isLoading = useAtomValue(isLoadingAtom)
  const text = useAtomValue(loadingTextAtom)
  if (!isLoading) return null
  return (
    <Box style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 50 }}>
      <Paper withBorder p="md" radius="md">
        <Stack gap={8} align="center">
          <Loader size="sm" />
          <Text size="xs" c="dimmed">{text}</Text>
        </Stack>
      </Paper>
    </Box>
  )
}


export function MainContent() {
  return (
    <>
      <LoadingOverlay />
      <SceneCanvas>
        <Lights />
        <OrbitControlsRig />
        {MODELS_TO_LOAD.map((m) => (
          <GLTFModel
            key={m.name}
            name={m.name}
            url={m.url}
            defaultVisible={m.defaultVisible}
            scale={m.scale}
          />
        ))}
      </SceneCanvas>
    </>
  )
}

export default function PlaygroundView() {
  const setText = useSetAtom(setLoadingTextAtom)
  const setVisible = useSetAtom(setModelVisibleAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)
  const resetAll = useSetAtom(resetAllShapeKeysAtom)

  useEffect(() => {
    setText('Loading models...')
  }, [setText])

  useEffect(() => {
    MODELS_TO_LOAD.forEach((m) => setVisible({ name: m.name, visible: !!m.defaultVisible }))
    const t = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(t)
  }, [setIsLoading, setVisible])

  return (
    <AppShell padding={0} withBorder={false} style={{ height: '100svh', overflow: 'hidden' }}>
      <AppShell.Main>
        <Box style={{ position: 'relative', height: '100svh', width: '100%', overflow: 'hidden', }}
          className="canvas-background"
        >
          {/* Main content */}
          <MainContent />

          {/* Left overlay: Clothing selector */}
          <Box
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              width: 280,
              height: 'calc(100% - 32px)',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
          >
            {/* Clothing selector */}
            <Paper
              withBorder
              radius="md"
              p={0}
              shadow="lg"
              style={{
                height: '100%'
              }}
            >
              <Box p="md">
                <Title order={5}>Clothing</Title>
              </Box>
              <Divider />
              <ClothingSelector />
            </Paper>
          </Box>

          {/* Right overlay: Controls */}
          <Box
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 360,
              height: 'calc(100% - 32px)',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
          >
            {/* Right overlay: Controls */}
            <Paper
              withBorder
              radius="md"
              p={0}
              shadow="lg"
              style={{
                height: '100%',
              }}
            >
              <Stack gap="md" p="md" h="100%">
                <Group justify="space-between" style={{ height: 'auto' }}>
                  <Title order={5}>Avatar Settings</Title>
                  <Button color="red" variant="light" size="xs" onClick={() => resetAll()}>
                    Reset
                  </Button>
                </Group>
                <ZoomControl />
                <PerfToggle />
                <ScrollArea variant="light" style={{ height: '100%', flex: 1, borderRadius: 8 }}>
                  <Stack gap="md" py="md">
                    <ShapeKeyPanels />
                  </Stack>
                </ScrollArea>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}


