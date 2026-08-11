import Button from "@/components/ui/button/button";
import Input from "@/components/ui/input/input";
import Title from "@/components/ui/title/title";
import React from "react";

export default function OfficePage(): React.ReactNode {
  return (
    <div>
      <Title title="Profile perusahaan" />
      {/* Container */}
      <div className="flex flex-col gap-y-6 w-full">
        {/* Item */}
        <div className="flex flex-col w-full justify-between items-center pb-6 border-b border-gray-200">
          <div className="flex w-full justify-between gap-y-1">
            <label className="text-md font-semibold">Nama Perusahaan</label>
            <Button variant="link">{false ? "Batalkan" : "Edit"}</Button>
          </div>
          <div className="flex w-full justify-start mt-1">
            {false ? (
              <div className="w-full space-y-3">
                <p className="text-sm text-gray-400 font-extralight">
                  Pastikan nama perusahaan sesuai
                </p>
                <Input label="Nama perusahaan" value="Bank Wonosobo" />
                <Button variant="secondary">Simpan</Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Bank Wonosobo</p>
            )}
          </div>
        </div>

        <div className="flex flex-col w-full justify-between items-center pb-6 border-b border-gray-200">
          <div className="flex w-full justify-between gap-y-1">
            <label className="text-md font-semibold">Bidang usaha</label>
            <Button variant="link">{false ? "Batalkan" : "Edit"}</Button>
          </div>
          <div className="flex w-full justify-start mt-1">
            {false ? (
              <div className="w-full space-y-3">
                <p className="text-sm text-gray-400 font-extralight">
                  Pastikan nama perusahaan sesuai
                </p>
                <Input label="Nama perusahaan" value="Bank Wonosobo" />
                <Button variant="secondary">Simpan</Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Perbankan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
