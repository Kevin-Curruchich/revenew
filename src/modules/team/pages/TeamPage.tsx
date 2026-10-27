import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, LoadingState } from "@/components/shared/QueryStates";
import { useAuthStore } from "@/modules/auth";
import { AddMemberDialog } from "../components/AddMemberDialog";
import { MemberActions } from "../components/MemberActions";
import { roleLabels } from "../domain/team";
import { useMembers } from "../hooks/useTeam";

export const TeamPage = () => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isPending, isError, error, refetch } = useMembers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        description="Quién puede entrar a tu comercio"
        actions={<AddMemberDialog />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Miembros</CardTitle>
          <CardDescription>
            Los vendedores registran ventas; solo lectura solo puede consultar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <LoadingState label="Cargando equipo..." />
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Rol y acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.display_name ?? "—"}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {member.is_active ? (
                        <Badge variant="outline">Activo</Badge>
                      ) : (
                        <Badge variant="destructive">Desactivado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Locking yourself out could leave the business without an admin. */}
                      {member.id === currentUserId ? (
                        <span className="text-sm text-muted-foreground">
                          {roleLabels[member.role]} (tú)
                        </span>
                      ) : (
                        <MemberActions member={member} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
