'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceDependency } from '@/types/incident';

interface ServiceDependencyGraphProps {
  graph: ServiceDependency[];
  highlightedService?: string;
  rootCauseText?: string;
}

type GraphNode = {
  id: string;
  x: number;
  y: number;
  label: string;
};

function buildGraphNodes(graph: ServiceDependency[]): GraphNode[] {
  const all = new Set<string>();
  graph.forEach((entry) => {
    all.add(entry.service);
    entry.dependsOn.forEach((dep) => all.add(dep));
  });

  const services = Array.from(all);
  return services.map((service, index) => ({
    id: service,
    label: service,
    x: 120 + (index % 3) * 220,
    y: 80 + Math.floor(index / 3) * 120,
  }));
}

export function ServiceDependencyGraph({
  graph,
  highlightedService,
  rootCauseText,
}: ServiceDependencyGraphProps) {
  const nodes = buildGraphNodes(graph);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const width = 760;
  const height = Math.max(240, Math.ceil(nodes.length / 3) * 140 + 40);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">AI Service Dependency Graph</CardTitle>
      </CardHeader>
      <CardContent>
        {nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No service dependencies were inferred.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border/50">
            <svg width={width} height={height} className="bg-muted/20">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="8"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" className="fill-primary/70" />
                </marker>
              </defs>

              {graph.flatMap((edge) =>
                edge.dependsOn.map((dependency) => {
                  const source = nodeMap.get(edge.service);
                  const target = nodeMap.get(dependency);
                  if (!source || !target) return null;
                  return (
                    <line
                      key={`${edge.service}-${dependency}`}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      className="stroke-primary/70"
                      strokeWidth={1.7}
                      markerEnd="url(#arrowhead)"
                    />
                  );
                }),
              )}

              {nodes.map((node) => {
                const isHighlighted =
                  (highlightedService &&
                    node.label.toLowerCase().includes(highlightedService.toLowerCase())) ||
                  (rootCauseText &&
                    rootCauseText.toLowerCase().includes(node.label.toLowerCase()));
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x - 78}
                      y={node.y - 22}
                      width={156}
                      height={44}
                      rx={10}
                      className={isHighlighted ? 'fill-red-500/20 stroke-red-500' : 'fill-card stroke-border'}
                      strokeWidth={1.5}
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="fill-foreground text-xs"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
