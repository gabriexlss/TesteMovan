import * as z from 'zod';

const AlunoSchema = z.object({
    id: z.number().positive(),
    nome: z.string().min(2).max(100),
    email: z.string().email(),
    idade: z.number().int().positive(),
    escola: z.string().min(2).max(100),
    turno: z.enum(['Manhã', 'Tarde', 'Noite']),
    serie: z.string().min(1).max(20),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
});

export type Aluno = z.infer<typeof AlunoSchema>;