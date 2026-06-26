import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse, AppError, calculateDistance } from '@/server/utils';
import type { IIssue } from '@/server/interfaces';

const issueService = new IssueService();

/**
 * GET /api/map/clusters?lat=X&lng=Y&radius=Z&zoom=N — Get issue clusters for map
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '10');
  const zoom = parseInt(searchParams.get('zoom') || '12', 10);

  if (isNaN(lat) || isNaN(lng)) throw AppError.badRequest('lat and lng are required');

  const issues = await issueService.getNearbyIssues(lat, lng, radius);

  // Simple grid-based clustering
  const gridSize = getGridSize(zoom);
  const clusters = new Map<string, { lat: number; lng: number; count: number; issueIds: string[] }>();

  for (const issue of issues) {
    const cellLat = Math.round(issue.location.lat / gridSize) * gridSize;
    const cellLng = Math.round(issue.location.lng / gridSize) * gridSize;
    const key = `${cellLat},${cellLng}`;

    if (clusters.has(key)) {
      const cluster = clusters.get(key)!;
      cluster.count++;
      cluster.issueIds.push(issue.id);
      // Weighted center
      cluster.lat = (cluster.lat * (cluster.count - 1) + issue.location.lat) / cluster.count;
      cluster.lng = (cluster.lng * (cluster.count - 1) + issue.location.lng) / cluster.count;
    } else {
      clusters.set(key, {
        lat: issue.location.lat,
        lng: issue.location.lng,
        count: 1,
        issueIds: [issue.id],
      });
    }
  }

  return successResponse(Array.from(clusters.values()));
});

function getGridSize(zoom: number): number {
  // Larger grid at lower zoom = more clustering
  if (zoom <= 8) return 1;
  if (zoom <= 10) return 0.5;
  if (zoom <= 12) return 0.1;
  if (zoom <= 14) return 0.01;
  return 0.005;
}
