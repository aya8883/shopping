import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1.5}
      sx={{ mb: 1.5 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            lineHeight: 1.25,
            fontSize: '1.15rem',
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

export function Surface({
  children,
  accent = false,
  className,
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Box
      className={className}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: accent ? 'rgba(245, 196, 0, 0.35)' : 'rgba(26, 26, 26, 0.06)',
        background: accent
          ? 'linear-gradient(145deg, #FFF8D6 0%, #FFFFFF 60%)'
          : '#FFFFFF',
        boxShadow: accent
          ? '0 12px 28px rgba(245, 196, 0, 0.14)'
          : '0 8px 22px rgba(15, 23, 42, 0.05)',
      }}
    >
      {children}
    </Box>
  );
}

export function StepBadge({ step }: { step: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: '999px',
        marginInlineEnd: 1,
        fontSize: '0.8rem',
        fontWeight: 800,
        color: '#1A1A1A',
        background: '#F5C400',
        boxShadow: '0 4px 10px rgba(245,196,0,0.35)',
        verticalAlign: 'middle',
      }}
    >
      {step}
    </Box>
  );
}
