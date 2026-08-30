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
      alignItems="flex-end"
      justifyContent="space-between"
      gap={1.5}
      sx={{ mb: 1.5 }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.25,
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
        borderColor: accent ? 'rgba(13, 148, 136, 0.22)' : 'rgba(15, 118, 110, 0.10)',
        background: accent
          ? 'linear-gradient(145deg, rgba(240,253,250,0.95) 0%, rgba(255,255,255,0.92) 55%, rgba(255,247,237,0.55) 100%)'
          : 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(10px)',
        boxShadow: accent
          ? '0 10px 28px rgba(13, 148, 136, 0.10)'
          : '0 6px 20px rgba(15, 61, 58, 0.045)',
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
        color: '#F0FDFA',
        background: 'linear-gradient(135deg, #0D9488, #0F766E)',
        boxShadow: '0 4px 10px rgba(13,148,136,0.28)',
        verticalAlign: 'middle',
      }}
    >
      {step}
    </Box>
  );
}
